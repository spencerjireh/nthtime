from solution import find_disappeared_numbers


def test_basic():
    assert sorted(find_disappeared_numbers([4, 3, 2, 7, 8, 2, 3, 1])) == [5, 6]


def test_all_duplicate():
    assert find_disappeared_numbers([1, 1]) == [2]


def test_no_missing():
    assert find_disappeared_numbers([1]) == []


def test_all_same():
    assert sorted(find_disappeared_numbers([2, 2, 2])) == [1, 3]


def test_reverse_order():
    assert find_disappeared_numbers([3, 2, 1]) == []


def test_larger():
    nums = [1, 1, 2, 2, 3, 3]
    assert sorted(find_disappeared_numbers(nums)) == [4, 5, 6]
