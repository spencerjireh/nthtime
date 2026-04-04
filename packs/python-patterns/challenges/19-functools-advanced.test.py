from solution import Temperature, format_value


def test_temperature_equality():
    assert Temperature(20) == Temperature(20)


def test_temperature_inequality():
    assert Temperature(10) != Temperature(20)


def test_temperature_less_than():
    assert Temperature(10) < Temperature(20)


def test_temperature_greater_than():
    assert Temperature(30) > Temperature(20)


def test_temperature_less_equal():
    assert Temperature(10) <= Temperature(20)
    assert Temperature(20) <= Temperature(20)


def test_temperature_greater_equal():
    assert Temperature(30) >= Temperature(20)
    assert Temperature(20) >= Temperature(20)


def test_temperature_repr():
    assert repr(Temperature(25)) == "Temperature(25)"


def test_format_value_int():
    assert format_value(42) == "int: 42"


def test_format_value_float():
    assert format_value(3.14) == "float: 3.14"


def test_format_value_str():
    assert format_value("hello") == "str: hello"


def test_format_value_list():
    assert format_value([1, 2, 3]) == "list[3]"


def test_format_value_empty_list():
    assert format_value([]) == "list[0]"


def test_format_value_unknown_type():
    assert format_value({}) == "unknown"
    assert format_value(None) == "unknown"
