from solution import Color


def test_str_output():
    c = Color(255, 128, 0)
    assert str(c) == "rgb(255, 128, 0)"


def test_repr_output():
    c = Color(255, 128, 0)
    assert repr(c) == "Color(255, 128, 0)"


def test_hex_output():
    c = Color(255, 128, 0)
    assert c.hex() == "#ff8000"


def test_black():
    c = Color(0, 0, 0)
    assert str(c) == "rgb(0, 0, 0)"
    assert repr(c) == "Color(0, 0, 0)"
    assert c.hex() == "#000000"


def test_white():
    c = Color(255, 255, 255)
    assert str(c) == "rgb(255, 255, 255)"
    assert repr(c) == "Color(255, 255, 255)"
    assert c.hex() == "#ffffff"


def test_hex_zero_padding():
    c = Color(1, 2, 3)
    assert c.hex() == "#010203"
