from solution import move_zeroes


def test_basic():
    nums = [0, 1, 0, 3, 12]
    move_zeroes(nums)
    assert nums == [1, 3, 12, 0, 0]


def test_single_zero():
    nums = [0]
    move_zeroes(nums)
    assert nums == [0]


def test_single_nonzero():
    nums = [1]
    move_zeroes(nums)
    assert nums == [1]


def test_leading_zeroes():
    nums = [0, 0, 1]
    move_zeroes(nums)
    assert nums == [1, 0, 0]


def test_no_zeroes():
    nums = [1, 2, 3]
    move_zeroes(nums)
    assert nums == [1, 2, 3]


def test_all_zeroes():
    nums = [0, 0, 0]
    move_zeroes(nums)
    assert nums == [0, 0, 0]


def test_returns_none():
    nums = [0, 1]
    result = move_zeroes(nums)
    assert result is None
