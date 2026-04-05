from collections import deque
from solution import sliding_window, recent_items, rotate_list


def test_sliding_window_basic():
    result = list(sliding_window([1, 2, 3, 4, 5], 3))
    assert result == [[1, 2, 3], [2, 3, 4], [3, 4, 5]]


def test_sliding_window_size_one():
    result = list(sliding_window([1, 2, 3], 1))
    assert result == [[1], [2], [3]]


def test_sliding_window_full_size():
    result = list(sliding_window([1, 2, 3], 3))
    assert result == [[1, 2, 3]]


def test_sliding_window_larger_than_input():
    result = list(sliding_window([1, 2], 5))
    assert result == []


def test_sliding_window_empty():
    result = list(sliding_window([], 3))
    assert result == []


def test_sliding_window_strings():
    result = list(sliding_window("abcd", 2))
    assert result == [["a", "b"], ["b", "c"], ["c", "d"]]


def test_recent_items_basic():
    result = recent_items(range(100), 3)
    assert isinstance(result, deque)
    assert list(result) == [97, 98, 99]


def test_recent_items_fewer_than_max():
    result = recent_items([1, 2], 5)
    assert list(result) == [1, 2]


def test_recent_items_exact_size():
    result = recent_items([1, 2, 3], 3)
    assert list(result) == [1, 2, 3]


def test_recent_items_empty():
    result = recent_items([], 5)
    assert list(result) == []


def test_recent_items_maxlen():
    result = recent_items(range(10), 4)
    assert result.maxlen == 4


def test_rotate_list_right():
    assert rotate_list([1, 2, 3, 4, 5], 2) == [4, 5, 1, 2, 3]


def test_rotate_list_left():
    assert rotate_list([1, 2, 3, 4, 5], -1) == [2, 3, 4, 5, 1]


def test_rotate_list_zero():
    assert rotate_list([1, 2, 3], 0) == [1, 2, 3]


def test_rotate_list_full_rotation():
    assert rotate_list([1, 2, 3], 3) == [1, 2, 3]


def test_rotate_list_empty():
    assert rotate_list([], 5) == []


def test_rotate_list_single():
    assert rotate_list([42], 7) == [42]
