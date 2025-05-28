from backend import timeline
from numpy import timedelta64

def test_get_entries_in_time_period_result_exists():
    """Test the function returns something for a valid query which
    is expected to return results"""

    instance = 'Q23038290'
    start_time = '-100000000-01-01T00:00:00Z'
    end_time = '-50000000-01-01T00:00:00Z'

    result = timeline.get_entries_in_time_period(instance, start_time, end_time)
    assert result

def test_get_entries_in_time_period_no_result():
    """Test the function detects when there is nothing returned"""

    instance = 'Q5'
    start_time = '-100000000-01-01T00:00:00Z'
    end_time = '-50000000-01-01T00:00:00Z'

    result = timeline.get_entries_in_time_period(instance, start_time, end_time)

    assert not result