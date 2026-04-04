from solution import min_max, divide


def test_min_max_positive():
    assert min_max([3, 1, 4, 1, 5]) == (1, 5)


def test_min_max_negative():
    assert min_max([-3, -1, -4, -1, -5]) == (-5, -1)


def test_min_max_single():
    assert min_max([42]) == (42, 42)


def test_divide_basic():
    assert divide(10, 3) == (3, 1)


def test_divide_exact():
    assert divide(10, 2) == (5, 0)


def test_divide_by_zero():
    assert divide(10, 0) == (None, None)
