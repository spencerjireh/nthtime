from solution import two_sum


def test_basic():
    assert sorted(two_sum([2, 7, 11, 15], 9)) == [0, 1]


def test_middle_pair():
    assert sorted(two_sum([3, 2, 4], 6)) == [1, 2]


def test_duplicates():
    assert sorted(two_sum([3, 3], 6)) == [0, 1]


def test_negatives():
    assert sorted(two_sum([-1, -2, -3, -4, -5], -8)) == [2, 4]


def test_large():
    nums = list(range(10000))
    assert sorted(two_sum(nums, 19997)) == [9998, 9999]
