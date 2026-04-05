from solution import find_max_average


def test_basic():
    assert find_max_average([1, 12, -5, -6, 50, 3], 4) == 12.75


def test_single():
    assert find_max_average([5], 1) == 5.0


def test_window_one():
    assert find_max_average([0, 4, 0, 3, 2], 1) == 4.0


def test_full_array():
    assert find_max_average([1, 2, 3, 4, 5], 5) == 3.0


def test_negatives():
    assert find_max_average([-1, -2, -3, -4], 2) == -1.5


def test_all_same():
    assert find_max_average([7, 7, 7, 7], 2) == 7.0
