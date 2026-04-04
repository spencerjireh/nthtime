from solution import to_binary, to_hex, from_base, format_byte


def test_to_binary_zero():
    assert to_binary(0) == "0"


def test_to_binary_positive():
    assert to_binary(5) == "101"
    assert to_binary(255) == "11111111"


def test_to_binary_negative():
    assert to_binary(-3) == "-11"
    assert to_binary(-1) == "-1"


def test_to_hex_zero():
    assert to_hex(0) == "0"


def test_to_hex_positive():
    assert to_hex(255) == "ff"
    assert to_hex(16) == "10"


def test_to_hex_negative():
    assert to_hex(-16) == "-10"
    assert to_hex(-255) == "-ff"


def test_from_base_binary():
    assert from_base("1010", 2) == 10
    assert from_base("0", 2) == 0


def test_from_base_octal():
    assert from_base("77", 8) == 63


def test_from_base_hex():
    assert from_base("ff", 16) == 255
    assert from_base("FF", 16) == 255


def test_format_byte_zero():
    assert format_byte(0) == "00"


def test_format_byte_small():
    assert format_byte(10) == "0A"
    assert format_byte(15) == "0F"


def test_format_byte_large():
    assert format_byte(255) == "FF"
    assert format_byte(171) == "AB"
