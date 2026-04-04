from solution import sliding_window, pairwise, take_while


def test_sliding_window_basic():
    result = list(sliding_window([1, 2, 3, 4], 3))
    assert result == [[1, 2, 3], [2, 3, 4]]


def test_sliding_window_size_one():
    result = list(sliding_window([1, 2, 3], 1))
    assert result == [[1], [2], [3]]


def test_sliding_window_full_size():
    result = list(sliding_window([1, 2, 3], 3))
    assert result == [[1, 2, 3]]


def test_sliding_window_size_two():
    result = list(sliding_window([10, 20, 30, 40], 2))
    assert result == [[10, 20], [20, 30], [30, 40]]


def test_pairwise_basic():
    result = list(pairwise([1, 2, 3]))
    assert result == [(1, 2), (2, 3)]


def test_pairwise_four():
    result = list(pairwise([1, 2, 3, 4]))
    assert result == [(1, 2), (2, 3), (3, 4)]


def test_pairwise_two():
    result = list(pairwise([1, 2]))
    assert result == [(1, 2)]


def test_pairwise_single():
    result = list(pairwise([1]))
    assert result == []


def test_take_while_basic():
    result = list(take_while(lambda x: x < 4, [1, 2, 3, 5, 1]))
    assert result == [1, 2, 3]


def test_take_while_all_pass():
    result = list(take_while(lambda x: x > 0, [1, 2, 3]))
    assert result == [1, 2, 3]


def test_take_while_none_pass():
    result = list(take_while(lambda x: x > 10, [1, 2, 3]))
    assert result == []


def test_take_while_stops_early():
    result = list(take_while(lambda x: x % 2 != 0, [1, 3, 4, 5, 7]))
    assert result == [1, 3]
