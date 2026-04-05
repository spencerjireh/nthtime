from solution import construct2d_array


def test_basic():
    assert construct2d_array([1, 2, 3, 4], 2, 2) == [[1, 2], [3, 4]]


def test_single_row():
    assert construct2d_array([1, 2, 3], 1, 3) == [[1, 2, 3]]


def test_impossible():
    assert construct2d_array([1, 2], 1, 1) == []


def test_single_column():
    assert construct2d_array([1, 2, 3], 3, 1) == [[1], [2], [3]]


def test_empty():
    assert construct2d_array([], 0, 0) == []


def test_larger():
    result = construct2d_array(list(range(1, 13)), 3, 4)
    assert result == [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]


def test_mismatch():
    assert construct2d_array([1, 2, 3, 4, 5], 2, 3) == []
