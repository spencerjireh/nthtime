import math

from solution import circle_area, clamp, is_even


def test_circle_area_zero():
    assert circle_area(0) == 0


def test_circle_area_one():
    assert circle_area(1) == math.pi


def test_circle_area_five():
    assert abs(circle_area(5) - 78.53981633974483) < 1e-9


def test_clamp_within_range():
    assert clamp(5, 0, 10) == 5


def test_clamp_below_range():
    assert clamp(-5, 0, 10) == 0


def test_clamp_above_range():
    assert clamp(15, 0, 10) == 10


def test_clamp_at_boundary():
    assert clamp(0, 0, 10) == 0
    assert clamp(10, 0, 10) == 10


def test_is_even_true():
    assert is_even(4) is True


def test_is_even_false():
    assert is_even(7) is False


def test_is_even_zero():
    assert is_even(0) is True


def test_is_even_negative():
    assert is_even(-2) is True
    assert is_even(-3) is False
