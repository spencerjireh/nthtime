import math

from solution import make_point, distance, swap


def test_make_point():
    assert make_point(3, 4) == (3, 4)


def test_make_point_negative():
    assert make_point(-1, -2) == (-1, -2)


def test_make_point_zero():
    assert make_point(0, 0) == (0, 0)


def test_distance_same_point():
    assert distance((0, 0), (0, 0)) == 0.0


def test_distance_unit():
    assert distance((0, 0), (1, 0)) == 1.0


def test_distance_diagonal():
    assert distance((0, 0), (3, 4)) == 5.0


def test_distance_negative_coords():
    assert abs(distance((-1, -1), (2, 3)) - 5.0) < 1e-9


def test_swap_ints():
    assert swap(1, 2) == (2, 1)


def test_swap_strings():
    assert swap("hello", "world") == ("world", "hello")


def test_swap_mixed():
    assert swap(42, "abc") == ("abc", 42)
