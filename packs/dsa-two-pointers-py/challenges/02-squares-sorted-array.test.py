from solution import sorted_squares


def test_mixed_negatives():
    assert sorted_squares([-4, -1, 0, 3, 10]) == [0, 1, 9, 16, 100]


def test_mixed_negatives_two():
    assert sorted_squares([-7, -3, 2, 3, 11]) == [4, 9, 9, 49, 121]


def test_single_element():
    assert sorted_squares([1]) == [1]


def test_all_negative():
    assert sorted_squares([-5, -3, -1]) == [1, 9, 25]


def test_all_positive():
    assert sorted_squares([1, 2, 3, 4]) == [1, 4, 9, 16]


def test_zeroes():
    assert sorted_squares([-2, 0, 0, 3]) == [0, 0, 4, 9]


def test_single_negative():
    assert sorted_squares([-1]) == [1]
