from solution import single_number


def test_basic():
    assert single_number([2, 2, 1]) == 1


def test_middle():
    assert single_number([4, 1, 2, 1, 2]) == 4


def test_single():
    assert single_number([1]) == 1


def test_negatives():
    assert single_number([-1, -1, -2]) == -2


def test_zero():
    assert single_number([0, 1, 1]) == 0


def test_large():
    nums = list(range(1, 10001)) * 2 + [99999]
    assert single_number(nums) == 99999
