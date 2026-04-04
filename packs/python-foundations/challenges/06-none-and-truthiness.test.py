from solution import safe_len, first_truthy, is_empty


def test_safe_len_none():
    assert safe_len(None) == 0


def test_safe_len_string():
    assert safe_len("hello") == 5
    assert safe_len("") == 0


def test_safe_len_list():
    assert safe_len([1, 2, 3]) == 3
    assert safe_len([]) == 0


def test_first_truthy_found():
    assert first_truthy(0, "", [], "found") == "found"
    assert first_truthy(False, 42) == 42


def test_first_truthy_all_falsy():
    assert first_truthy(0, None, False, "", []) is None


def test_first_truthy_zero_then_value():
    assert first_truthy(0, 0, 0, "yes") == "yes"
    assert first_truthy(0, [], "", 1) == 1


def test_is_empty_none():
    assert is_empty(None) is True


def test_is_empty_empty_string():
    assert is_empty("") is True


def test_is_empty_zero():
    assert is_empty(0) is True


def test_is_empty_nonempty():
    assert is_empty("hello") is False
    assert is_empty([1, 2]) is False
    assert is_empty(42) is False
