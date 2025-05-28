from backend import timeline
from numpy import timedelta64, datetime64

# Test divide 1, time range years
# Test divide 2, time range years
# Test divide 10, time range years
# Test divide 10, time range 1 year
# Test divide 10, time range 1 month
# Test divide 10, time range 1 day

def test_split_time_range_into_1():
    """Test the function works when asked to split the time range into 1 part"""

    start_time = '-100000000-01-01T00:00:00Z'
    end_time = '-50000000-01-01T00:00:00Z'
    n = 1

    result = timeline.split_time_range(start_time, end_time, n)
    expected_result = [datetime64('-100000000-01-01T00:00:00Z')]

    assert result == expected_result

def test_split_time_range_into_2():
    """Test the function works when asked to split the time range into 2 parts"""

    start_time = '-100000000-01-01T00:00:00Z'
    end_time = '-50000000-01-01T00:00:00Z'
    n = 2

    result = timeline.split_time_range(start_time, end_time, n)
    expected_result = [datetime64('-100000000-01-01T00:00:00Z'), datetime64('-75000000-01-01T00:00:00Z')]

    assert result == expected_result

def test_split_time_range_into_multiple():
    """Test the function works when asked to split the time range into multiple, more than 2 parts"""

    start_time = '-100000000-01-01T00:00:00Z'
    end_time = '-50000000-01-01T00:00:00Z'
    n = 10

    result = timeline.split_time_range(start_time, end_time, n)
    expected_result = [datetime64('-100000000-01-01T00:00:00Z'), datetime64('-95000000-01-01T00:00:00Z'), datetime64('-90000000-01-01T00:00:00Z'),
        datetime64('-85000000-01-01T00:00:00Z'), datetime64('-80000000-01-01T00:00:00Z'), datetime64('-75000000-01-01T00:00:00Z'), 
        datetime64('-70000000-01-01T00:00:00Z'), datetime64('-65000000-01-01T00:00:00Z'), datetime64('-60000000-01-01T00:00:00Z'),
        datetime64('-55000000-01-01T00:00:00Z')]

    assert result == expected_result

def test_split_time_range_into_multiple_range_1_year():
    """Test the function works when asked to split the time range into multiple, more than 2 parts and
    the given time range is a year"""

    start_time = '+2023-01-01T00:00:00Z'
    end_time = '+2024-01-01T00:00:00Z'
    n = 10

    result = timeline.split_time_range(start_time, end_time, n)
    expected_result = [datetime64('+2023-01-01T00:00:00Z'), datetime64('+2023-02-06T12:00:00Z'), datetime64('+2023-03-15T00:00:00Z'),
        datetime64('+2023-04-20T12:00:00Z'), datetime64('+2023-05-27T00:00:00Z'), datetime64('+2023-07-02T12:00:00Z'),
        datetime64('+2023-08-08T00:00:00Z'), datetime64('+2023-09-13T12:00:00Z'), datetime64('+2023-10-20T00:00:00Z'),
        datetime64('+2023-11-25T12:00:00Z')]

    assert result == expected_result

def test_split_time_range_into_multiple_range_1_month():
    """Test the function works when asked to split the time range into multiple, more than 2 parts and
    the given time range is a month"""

    start_time = '-100000000-09-01T00:00:00Z'
    end_time = '-100000000-10-01T00:00:00Z'
    n = 10

    result = timeline.split_time_range(start_time, end_time, n)
    expected_result = [datetime64('-100000000-09-01T00:00:00Z'), datetime64('-100000000-09-04T00:00:00Z'), datetime64('-100000000-09-07T00:00:00Z'),
        datetime64('-100000000-09-10T00:00:00Z'), datetime64('-100000000-09-13T00:00:00Z'), datetime64('-100000000-09-16T00:00:00Z'),
        datetime64('-100000000-09-19T00:00:00Z'), datetime64('-100000000-09-22T00:00:00Z'), datetime64('-100000000-09-25T00:00:00Z'), 
        datetime64('-100000000-09-28T00:00:00Z')]

    assert result == expected_result

def test_split_time_range_into_multiple_range_1_day():
    """Test the function works when asked to split the time range into multiple, more than 2 parts and
    the given time range is a month"""

    start_time = '-100000000-09-01T00:00:00Z'
    end_time = '-100000000-09-02T00:00:00Z'
    n = 10

    result = timeline.split_time_range(start_time, end_time, n)
    expected_result = [datetime64('-100000000-09-01T00:00:00Z'), datetime64('-100000000-09-01T02:24:00Z'), datetime64('-100000000-09-01T04:48:00Z'),
        datetime64('-100000000-09-01T07:12:00Z'), datetime64('-100000000-09-01T09:36:00Z'), datetime64('-100000000-09-01T12:00:00Z'),
        datetime64('-100000000-09-01T14:24:00Z'), datetime64('-100000000-09-01T16:48:00Z'), datetime64('-100000000-09-01T19:12:00Z'),
        datetime64('-100000000-09-01T21:36:00Z')]

    assert result == expected_result