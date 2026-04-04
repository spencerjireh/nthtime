from solution import sum_of_squares, first_match, all_positive


def test_sum_of_squares_basic():
    assert sum_of_squares(4) == 14


def test_sum_of_squares_zero():
    assert sum_of_squares(0) == 0


def test_sum_of_squares_one():
    assert sum_of_squares(1) == 0


def test_sum_of_squares_five():
    assert sum_of_squares(5) == 30


def test_first_match_found():
    assert first_match([1, 2, 3, 4], lambda x: x > 2) == 3


def test_first_match_first_item():
    assert first_match([10, 20, 30], lambda x: x >= 10) == 10


def test_first_match_no_match():
    assert first_match([1, 2, 3], lambda x: x > 5) is None


def test_first_match_empty():
    assert first_match([], lambda x: True) is None


def test_all_positive_true():
    assert all_positive([1, 2, 3]) is True


def test_all_positive_false():
    assert all_positive([1, -2, 3]) is False


def test_all_positive_zero():
    assert all_positive([0, 1, 2]) is False


def test_all_positive_empty():
    assert all_positive([]) is True
