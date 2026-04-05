from solution import majority_element


def test_basic():
    assert majority_element([3, 2, 3]) == 3


def test_longer():
    assert majority_element([2, 2, 1, 1, 1, 2, 2]) == 2


def test_single():
    assert majority_element([1]) == 1


def test_all_same():
    assert majority_element([5, 5, 5]) == 5


def test_two_elements():
    assert majority_element([1, 1, 2]) == 1


def test_large():
    nums = [42] * 5001 + list(range(4999))
    assert majority_element(nums) == 42
