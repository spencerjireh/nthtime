from solution import rotate_left, interleave, chunk


def test_rotate_left_basic():
    assert rotate_left([1, 2, 3, 4], 1) == [2, 3, 4, 1]


def test_rotate_left_by_two():
    assert rotate_left([1, 2, 3, 4], 2) == [3, 4, 1, 2]


def test_rotate_left_empty():
    assert rotate_left([], 3) == []


def test_rotate_left_n_greater_than_len():
    assert rotate_left([1, 2, 3], 5) == [3, 1, 2]


def test_rotate_left_zero():
    assert rotate_left([1, 2, 3], 0) == [1, 2, 3]


def test_rotate_left_full_rotation():
    assert rotate_left([1, 2, 3], 3) == [1, 2, 3]


def test_interleave_equal_length():
    assert interleave([1, 2, 3], ["a", "b", "c"]) == [1, "a", 2, "b", 3, "c"]


def test_interleave_unequal_length():
    assert interleave([1, 2], ["a", "b", "c"]) == [1, "a", 2, "b", "c"]


def test_interleave_first_longer():
    assert interleave([1, 2, 3], ["a"]) == [1, "a", 2, 3]


def test_interleave_one_empty():
    assert interleave([], [1, 2, 3]) == [1, 2, 3]


def test_interleave_both_empty():
    assert interleave([], []) == []


def test_chunk_exact():
    assert chunk([1, 2, 3, 4], 2) == [[1, 2], [3, 4]]


def test_chunk_remainder():
    assert chunk([1, 2, 3, 4, 5], 2) == [[1, 2], [3, 4], [5]]


def test_chunk_size_larger():
    assert chunk([1, 2], 5) == [[1, 2]]


def test_chunk_size_one():
    assert chunk([1, 2, 3], 1) == [[1], [2], [3]]


def test_chunk_empty():
    assert chunk([], 3) == []
