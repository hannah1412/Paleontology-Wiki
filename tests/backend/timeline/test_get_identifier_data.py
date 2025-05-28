from backend import timeline
from numpy import timedelta64

def test_get_identifier_data_result_exists():
    """Test the function returns something for a valid query which
    is expected to return results"""

    identifier = 'Q14332'
    start_time = '-100000000-01-01T00:00:00Z'
    end_time = '-50000000-01-01T00:00:00Z'

    result = timeline.get_identifier_data(identifier)
    assert result

def test_get_identifier_data_no_result():
    """Test the function detects when there is nothing returned"""

    identifier = 'Qaaaaaaaaaaa'

    result = timeline.get_identifier_data(identifier)

    assert not result