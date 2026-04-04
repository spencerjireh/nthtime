from solution import matrix_multiply, cartesian_product, filter_matrix


def test_matrix_multiply_2x2():
    a = [[1, 2], [3, 4]]
    b = [[5, 6], [7, 8]]
    assert matrix_multiply(a, b) == [[19, 22], [43, 50]]


def test_matrix_multiply_identity():
    a = [[1, 0], [0, 1]]
    b = [[5, 6], [7, 8]]
    assert matrix_multiply(a, b) == [[5, 6], [7, 8]]


def test_matrix_multiply_rectangular():
    a = [[1, 2, 3]]
    b = [[4], [5], [6]]
    assert matrix_multiply(a, b) == [[32]]


def test_matrix_multiply_3x3():
    a = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    b = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    assert matrix_multiply(a, b) == [[1, 2, 3], [4, 5, 6], [7, 8, 9]]


def test_cartesian_product_basic():
    result = cartesian_product([1, 2], ["a", "b"])
    assert result == [(1, "a"), (1, "b"), (2, "a"), (2, "b")]


def test_cartesian_product_single():
    result = cartesian_product([1], ["x"])
    assert result == [(1, "x")]


def test_cartesian_product_unequal():
    result = cartesian_product([1], ["a", "b", "c"])
    assert result == [(1, "a"), (1, "b"), (1, "c")]


def test_cartesian_product_empty():
    result = cartesian_product([], [1, 2])
    assert result == []


def test_filter_matrix_basic():
    result = filter_matrix([[1, -2], [3, -4]], lambda x: x > 0)
    assert result == [[1, None], [3, None]]


def test_filter_matrix_all_pass():
    result = filter_matrix([[1, 2], [3, 4]], lambda x: x > 0)
    assert result == [[1, 2], [3, 4]]


def test_filter_matrix_none_pass():
    result = filter_matrix([[1, 2], [3, 4]], lambda x: x > 10)
    assert result == [[None, None], [None, None]]


def test_filter_matrix_even():
    result = filter_matrix([[1, 2, 3], [4, 5, 6]], lambda x: x % 2 == 0)
    assert result == [[None, 2, None], [4, None, 6]]
