from solution import missing_number


def test_middle_missing():
    assert missing_number([3, 0, 1]) == 2


def test_last_missing():
    assert missing_number([0, 1]) == 2


def test_large():
    assert missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1]) == 8


def test_single():
    assert missing_number([0]) == 1


def test_zero_missing():
    assert missing_number([1]) == 0


def test_sequential():
    nums = list(range(1000))
    nums.remove(500)
    assert missing_number(nums) == 500
