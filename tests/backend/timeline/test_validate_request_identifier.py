from backend import timeline
from werkzeug.datastructures import MultiDict

missing_identifier_error = "ERROR: MISSING DATA: identifier"
wrong_identifier_format_error = "ERROR: identifier NOT IN EXPECTED WIKIDATA IDENTIFIER FORMAT"

def test_validate_request_identifier_no_identifier():
    '''Test the function with no identifier'''
    request_args = MultiDict([('startTime', '-100000000-01-01T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('rank', 'genus'), ('n', 100), ('reversePopularity', 'false')])
    validation_result = timeline.validate_request_identifier(request_args)

    expected_result = (False, missing_identifier_error)
    assert validation_result == expected_result

def test_validate_request_identifier_wrong_identifier_format():
    '''Test the function with identifier in wrong format'''
    request_args = MultiDict([('identifier', 'T123445'), ('startTime', '-100000000-01-01T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('rank', 'genus'), ('n', 100), ('reversePopularity', 'false')])
    validation_result = timeline.validate_request_identifier(request_args)

    expected_result = (False, wrong_identifier_format_error)
    assert validation_result == expected_result

def test_validate_request_identifier_proper():
    '''Test the function with proper identifier field'''
    request_args = MultiDict([('identifier', 'Q123456'), ('startTime', '-100000000-01-01T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('rank', 'genus'), ('n', 100), ('reversePopularity', 'false')])
    validation_result = timeline.validate_request_identifier(request_args)

    expected_result = (True, 'Q123456')
    assert validation_result == expected_result



