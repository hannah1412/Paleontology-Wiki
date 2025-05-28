from backend import timeline
from flask import Response

response = Response()


def test_returns_response():
    """Test that the response is of the correct type (trivial check)"""
    assert type(timeline.allows_cross_origin_request(response)) == Response


def test_access_control_header():
    """Test that the necessary response header is given"""
    assert timeline.allows_cross_origin_request(response).headers['Access-Control-Allow-Origin'] == '*'
