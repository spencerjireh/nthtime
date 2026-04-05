from solution import make_point, make_color, layered_config


def test_make_point_basic():
    p = make_point(3, 4)
    assert p.x == 3
    assert p.y == 4


def test_make_point_zero():
    p = make_point(0, 0)
    assert p.x == 0
    assert p.y == 0


def test_make_point_negative():
    p = make_point(-1, -2)
    assert p.x == -1
    assert p.y == -2


def test_make_point_is_tuple():
    p = make_point(3, 4)
    assert isinstance(p, tuple)
    assert p[0] == 3
    assert p[1] == 4


def test_make_point_unpacking():
    x, y = make_point(5, 10)
    assert x == 5
    assert y == 10


def test_make_color_no_alpha():
    c = make_color(255, 0, 0)
    assert c.r == 255
    assert c.g == 0
    assert c.b == 0
    assert c.a == 255


def test_make_color_with_alpha():
    c = make_color(255, 0, 0, 128)
    assert c.a == 128


def test_make_color_all_zeros():
    c = make_color(0, 0, 0, 0)
    assert c.r == 0
    assert c.a == 0


def test_make_color_is_tuple():
    c = make_color(10, 20, 30)
    assert isinstance(c, tuple)
    assert len(c) == 4


def test_layered_config_priority():
    result = layered_config({"a": 1}, {"a": 2, "b": 3})
    assert result == {"a": 1, "b": 3}


def test_layered_config_single():
    result = layered_config({"x": 10})
    assert result == {"x": 10}


def test_layered_config_three_layers():
    result = layered_config(
        {"a": 1},
        {"b": 2},
        {"a": 99, "b": 99, "c": 3},
    )
    assert result == {"a": 1, "b": 2, "c": 3}


def test_layered_config_empty_override():
    result = layered_config({}, {"a": 1, "b": 2})
    assert result == {"a": 1, "b": 2}


def test_layered_config_returns_dict():
    result = layered_config({"a": 1})
    assert type(result) is dict
