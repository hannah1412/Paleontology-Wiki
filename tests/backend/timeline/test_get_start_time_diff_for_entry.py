from backend import timeline
from numpy import timedelta64

def test_get_start_time_diff_for_entry_small_before():
    """Test the function works when the time difference is small and the
    entry's start time is before the given time"""

    start_time = '-100000000-01-01T00:00:00Z'
    entry = {'startTime': '-100000001-12-31T00:00:00Z'}

    result = timeline.get_start_time_diff_for_entry(start_time, entry)
    expected_result = timedelta64(1, 'D')

    assert result == expected_result


def test_get_start_time_diff_for_entry_small_after():
    """Test the function works when the time difference is small and the
    entry's start time is after the given time"""

    start_time = '-100000000-01-01T00:00:00Z'
    entry = {'startTime': '-100000000-02-05T00:00:00Z'}

    result = timeline.get_start_time_diff_for_entry(start_time, entry)
    expected_result = timedelta64(35, 'D')

    assert result == expected_result

def test_get_start_time_diff_for_entry_large_before():
    """Test the function works when the time difference is large and the
    entry's start time is before the given time"""

    start_time = '-100000000-01-01T00:00:00Z'
    entry = {'startTime': '-150000000-01-01T00:00:00Z'}

    result = timeline.get_start_time_diff_for_entry(start_time, entry).astype('timedelta64[Y]')
    expected_result = timedelta64(50000000, 'Y')

    assert result == expected_result

def test_get_start_time_diff_for_entry_large_after():
    """Test the function works when the time difference is large and the
    entry's start time is after the given time"""

    start_time = '-100000000-01-01T00:00:00Z'
    entry = {'startTime': '-50000000-01-01T00:00:00Z'}

    result = timeline.get_start_time_diff_for_entry(start_time, entry).astype('timedelta64[Y]')
    expected_result = timedelta64(50000000, 'Y')

    assert result == expected_result
