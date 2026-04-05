from solution import is_valid


def test_simple_pair():
    assert is_valid("()") is True


def test_multiple_types():
    assert is_valid("()[]{}") is True


def test_mismatch():
    assert is_valid("(]") is False


def test_interleaved_wrong():
    assert is_valid("([)]") is False


def test_nested():
    assert is_valid("{[]}") is True


def test_empty_string():
    assert is_valid("") is True


def test_single_opening():
    assert is_valid("(") is False
