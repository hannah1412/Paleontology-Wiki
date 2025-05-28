from backend import timeline
from werkzeug.datastructures import MultiDict

missing_start_time_error = "ERROR: MISSING DATA: startTime"
missing_end_time_error =  "ERROR: MISSING DATA: endTime"
missing_n_error = "ERROR: MISSING DATA: n"
non_int_n_error = "ERROR: n NOT AN INTEGER"
n_less_than_1_error = "ERROR: n MUST BE AT LEAST 1"
wrong_start_time_format_error = "ERROR: startTime NOT IN EXPECTED ISO 8601 FORMAT"
wrong_end_time_format_error = "ERROR: endTime NOT IN EXPECTED ISO 8601 FORMAT"

def test_validate_request_time_range_neg_date():
    """Test the function works when the request has negative dates in the date parameters"""
    request_args = MultiDict([('startTime', '-100000000-01-01T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('rank', 'genus'), ('n', 100), ('reversePopularity', 'false')])

    validation_result = timeline.validate_request_time_range(request_args)
    expected_validation_result = (True, '-100000000-01-01T00:00:00Z', '-50000000-01-01T00:00:00Z', 'genus', 100, False)

    assert validation_result == expected_validation_result

def test_validate_request_time_range_pos_date():
    """Test the function works when the request has positive dates in the date parameters"""
    request_args = MultiDict([('startTime', '+5-01-01T00:00:00Z'), ('endTime', '+2023-01-01T00:00:00Z'), ('rank', 'genus'), ('n', 100), ('reversePopularity', 'false')])

    validation_result = timeline.validate_request_time_range(request_args)
    expected_validation_result = (True, '+5-01-01T00:00:00Z', '+2023-01-01T00:00:00Z', 'genus', 100, False)

    assert validation_result == expected_validation_result

def test_validate_request_time_range_pos_and_neg_date():
    """Test the function works when the request has positive and negative dates in the date parameters"""
    request_args = MultiDict([('startTime', '-100000000-01-01T00:00:00Z'), ('endTime', '+2023-01-01T00:00:00Z'), ('rank', 'genus'), ('n', 100), ('reversePopularity', 'false')])

    validation_result = timeline.validate_request_time_range(request_args)
    expected_validation_result = (True, '-100000000-01-01T00:00:00Z', '+2023-01-01T00:00:00Z', 'genus', 100, False)

    assert validation_result == expected_validation_result
    
def test_validate_request_time_range_no_start_time():
    """Test the function detects when the request has no start_time parameter"""
    request_args = MultiDict([('endTime', '-50000000-01-01T00:00:00Z'), ('n', 100)])

    validation_result = timeline.validate_request_time_range(request_args)
    expected_validation_result = (False, missing_start_time_error)

    assert validation_result == expected_validation_result

def test_validate_request_time_range_no_end_time():
    """Test the function detects when the request has no end_time parameter"""
    request_args = MultiDict([('startTime', '-100000000-01-01T00:00:00Z'), ('n', 100)])

    validation_result = timeline.validate_request_time_range(request_args)
    expected_validation_result = (False, missing_end_time_error)

    assert validation_result == expected_validation_result

def test_validate_request_time_range_no_rank():
    """Test the function works when the request has no rank parameter"""
    request_args = MultiDict([('startTime', '-100000000-01-01T00:00:00Z'), ('endTime', '+2023-01-01T00:00:00Z'), ('n', 100), ('reversePopularity', 'false')])

    validation_result = timeline.validate_request_time_range(request_args)
    expected_validation_result = (True, '-100000000-01-01T00:00:00Z', '+2023-01-01T00:00:00Z', None, 100, False)

    assert validation_result == expected_validation_result

def test_validate_request_time_range_no_n():
    """Test the function works when the request has no n parameter"""
    request_args = MultiDict([('startTime', '-100000000-01-01T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z')])

    validation_result = timeline.validate_request_time_range(request_args)
    expected_validation_result = (False, missing_n_error)

    assert validation_result == expected_validation_result

def test_validate_request_time_range_non_int_n():
    """Test the function detects when the request's n parameter is not an integer"""
    request_args = MultiDict([('startTime', '-100000000-01-01T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 'notint')])

    validation_result = timeline.validate_request_time_range(request_args)
    expected_validation_result = (False, non_int_n_error)

    assert validation_result == expected_validation_result

def test_validate_request_time_range_n_less_than_1():
    """Test the function works when the request's n parameter is less than 1"""
    request_args = MultiDict([('startTime', '-100000000-01-01T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 0)])
    request_args2 = MultiDict([('startTime', '-100000000-01-01T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', -1)])

    validation_result = timeline.validate_request_time_range(request_args)
    expected_validation_result = (False, n_less_than_1_error)

    validation_result2 = timeline.validate_request_time_range(request_args2)

    assert validation_result == expected_validation_result
    assert validation_result2 == expected_validation_result

def test_validate_request_time_range_no_popularity():
    """Test the function works when the request has no popularity parameter"""
    request_args = MultiDict([('startTime', '-100000000-01-01T00:00:00Z'), ('endTime', '+2023-01-01T00:00:00Z'), ('n', 100)])

    validation_result = timeline.validate_request_time_range(request_args)
    expected_validation_result = (True, '-100000000-01-01T00:00:00Z', '+2023-01-01T00:00:00Z', None, 100, False)

    assert validation_result == expected_validation_result

def test_validate_request_time_range_incorrect_popularity():
    """Test the function works when the request's popularity parameter has an incorrect value"""
    request_args = MultiDict([('startTime', '-100000000-01-01T00:00:00Z'), ('endTime', '+2023-01-01T00:00:00Z'), ('n', 100), ('reversePopularity', 'wrong')])

    validation_result = timeline.validate_request_time_range(request_args)
    expected_validation_result = (False, "ERROR: reverse_popularity NOT A BOOLEAN")

    assert validation_result == expected_validation_result

def test_validate_request_time_range_wrong_start_time_format():
    """Test the function works when the request's start_time parameter does not follow the required format"""
    request_args_list = [MultiDict([('startTime', '100000000-01-01T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 10)])]
    request_args_list.append(MultiDict([('startTime', '-100000000-01-01T00:00:00'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('startTime', '-01-01T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('startTime', 'notatime'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('startTime', '-10000000001-01T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('startTime', '-100000000-0101T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('startTime', '-100000000-010100:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('startTime', '-100000000-0101T0000:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('startTime', '-100000000-0101T00:0000Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('startTime', '-100000000T00:00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('startTime', '+100000000-01-01T00:00Z'), ('endTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))

    expected_validation_result = (False, wrong_start_time_format_error)

    for request_args in request_args_list:
        validation_result = timeline.validate_request_time_range(request_args)
        assert validation_result == expected_validation_result

def test_validate_request_time_range_wrong_end_time_format():
    """Test the function works when the request's end_time parameter does not follow the required format"""
    request_args_list = [MultiDict([('endTime', '100000000-01-01T00:00:00Z'), ('startTime', '-50000000-01-01T00:00:00Z'), ('n', 10)])]
    request_args_list.append(MultiDict([('endTime', '-100000000-01-01T00:00:00'), ('startTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('endTime', '-01-01T00:00:00Z'), ('startTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('endTime', 'notatime'), ('startTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('endTime', '-10000000001-01T00:00:00Z'), ('startTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('endTime', '-100000000-0101T00:00:00Z'), ('startTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('endTime', '-100000000-010100:00:00Z'), ('startTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('endTime', '-100000000-0101T0000:00Z'), ('startTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('endTime', '-100000000-0101T00:0000Z'), ('startTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('endTime', '-100000000T00:00:00Z'), ('startTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))
    request_args_list.append(MultiDict([('endTime', '+100000000-01-01T00:00Z'), ('startTime', '-50000000-01-01T00:00:00Z'), ('n', 10)]))

    expected_validation_result = (False, wrong_end_time_format_error)

    for request_args in request_args_list:
        validation_result = timeline.validate_request_time_range(request_args)
        assert validation_result == expected_validation_result