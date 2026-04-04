from solution import squares, evens, flatten_pairs


def test_squares_five():
    assert squares(5) == [0, 1, 4, 9, 16]


def test_squares_zero():
    assert squares(0) == []


def test_squares_one():
    assert squares(1) == [0]


def test_squares_three():
    assert squares(3) == [0, 1, 4]


def test_evens_mixed():
    assert evens([1, 2, 3, 4, 5, 6]) == [2, 4, 6]


def test_evens_all_even():
    assert evens([2, 4, 6]) == [2, 4, 6]


def test_evens_all_odd():
    assert evens([1, 3, 5]) == []


def test_evens_empty():
    assert evens([]) == []


def test_evens_negative():
    assert evens([-2, -1, 0, 1, 2]) == [-2, 0, 2]


def test_flatten_pairs_basic():
    assert flatten_pairs([(1, 2), (3, 4)]) == [1, 2, 3, 4]


def test_flatten_pairs_single():
    assert flatten_pairs([(1, 2)]) == [1, 2]


def test_flatten_pairs_empty():
    assert flatten_pairs([]) == []


def test_flatten_pairs_strings():
    assert flatten_pairs([("a", "b"), ("c", "d")]) == ["a", "b", "c", "d"]
