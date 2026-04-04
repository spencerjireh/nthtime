from solution import http_status, describe_sequence


def test_http_status_200():
    assert http_status(200) == "OK"


def test_http_status_301():
    assert http_status(301) == "Moved Permanently"


def test_http_status_404():
    assert http_status(404) == "Not Found"


def test_http_status_500():
    assert http_status(500) == "Internal Server Error"


def test_http_status_unknown():
    assert http_status(418) == "Unknown"


def test_http_status_unknown_zero():
    assert http_status(0) == "Unknown"


def test_describe_sequence_empty():
    assert describe_sequence([]) == "empty"


def test_describe_sequence_single():
    assert describe_sequence([42]) == "single: 42"


def test_describe_sequence_single_string():
    assert describe_sequence(["hello"]) == "single: hello"


def test_describe_sequence_pair():
    assert describe_sequence([1, 2]) == "pair: 1, 2"


def test_describe_sequence_many():
    assert describe_sequence([1, 2, 3]) == "many: 3 items"


def test_describe_sequence_many_large():
    assert describe_sequence([1, 2, 3, 4, 5]) == "many: 5 items"
