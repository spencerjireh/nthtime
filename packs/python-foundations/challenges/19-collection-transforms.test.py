from solution import transpose, frequencies, partition


def test_transpose_square():
    assert transpose([[1, 2], [3, 4]]) == [[1, 3], [2, 4]]


def test_transpose_rectangular():
    assert transpose([[1, 2, 3], [4, 5, 6]]) == [[1, 4], [2, 5], [3, 6]]


def test_transpose_empty():
    assert transpose([]) == []


def test_transpose_single_row():
    assert transpose([[1, 2, 3]]) == [[1], [2], [3]]


def test_transpose_single_column():
    assert transpose([[1], [2], [3]]) == [[1, 2, 3]]


def test_frequencies_basic():
    result = frequencies(["a", "b", "a", "a", "b"])
    assert result["a"] == 3
    assert result["b"] == 2
    keys = list(result.keys())
    assert keys[0] == "a"


def test_frequencies_all_same():
    assert frequencies(["x", "x", "x"]) == {"x": 3}


def test_frequencies_empty():
    assert frequencies([]) == {}


def test_frequencies_numbers():
    result = frequencies([1, 2, 2, 3, 3, 3])
    assert result[3] == 3
    assert result[2] == 2
    assert result[1] == 1


def test_partition_even_odd():
    evens, odds = partition(lambda x: x % 2 == 0, [1, 2, 3, 4, 5, 6])
    assert evens == [2, 4, 6]
    assert odds == [1, 3, 5]


def test_partition_empty():
    truthy, falsy = partition(lambda x: x > 0, [])
    assert truthy == []
    assert falsy == []


def test_partition_all_match():
    truthy, falsy = partition(lambda x: x > 0, [1, 2, 3])
    assert truthy == [1, 2, 3]
    assert falsy == []


def test_partition_none_match():
    truthy, falsy = partition(lambda x: x > 0, [-1, -2, -3])
    assert truthy == []
    assert falsy == [-1, -2, -3]


def test_partition_strings():
    short, long = partition(lambda s: len(s) <= 3, ["hi", "hello", "hey", "world"])
    assert short == ["hi", "hey"]
    assert long == ["hello", "world"]
