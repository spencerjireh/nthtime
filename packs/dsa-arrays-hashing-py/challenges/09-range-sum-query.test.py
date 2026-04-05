from solution import NumArray


def test_basic_range():
    arr = NumArray([-2, 0, 3, -5, 2, -1])
    assert arr.sum_range(0, 2) == 1


def test_right_range():
    arr = NumArray([-2, 0, 3, -5, 2, -1])
    assert arr.sum_range(2, 5) == -1


def test_full_range():
    arr = NumArray([-2, 0, 3, -5, 2, -1])
    assert arr.sum_range(0, 5) == -3


def test_single_element():
    arr = NumArray([5])
    assert arr.sum_range(0, 0) == 5


def test_all_positives():
    arr = NumArray([1, 2, 3, 4, 5])
    assert arr.sum_range(1, 3) == 9


def test_multiple_queries():
    arr = NumArray([10, -10, 20, -20, 30])
    assert arr.sum_range(0, 4) == 30
    assert arr.sum_range(0, 1) == 0
    assert arr.sum_range(2, 4) == 30
