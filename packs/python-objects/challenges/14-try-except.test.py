from solution import safe_divide, parse_int, process_items


def test_safe_divide_valid():
    assert safe_divide(10, 3) == 10 / 3


def test_safe_divide_exact():
    assert safe_divide(10, 2) == 5.0


def test_safe_divide_zero():
    assert safe_divide(10, 0) is None


def test_safe_divide_negative():
    assert safe_divide(-6, 3) == -2.0


def test_parse_int_valid():
    assert parse_int("42") == 42


def test_parse_int_invalid():
    assert parse_int("abc") == 0


def test_parse_int_custom_default():
    assert parse_int("abc", -1) == -1


def test_parse_int_negative():
    assert parse_int("-5") == -5


def test_parse_int_float_string():
    assert parse_int("3.14") == 0


def test_process_items_success():
    result = process_items([1, 2, 3], lambda x: x * 10)
    assert result == {1: 10, 2: 20, 3: 30}


def test_process_items_with_error():
    result = process_items([1, 0], lambda x: 10 // x)
    assert result[1] == 10
    assert result[0].startswith("error:")


def test_process_items_all_errors():
    result = process_items(["a", "b"], lambda x: int(x))
    assert all(v.startswith("error:") for v in result.values())


def test_process_items_empty():
    result = process_items([], lambda x: x)
    assert result == {}
