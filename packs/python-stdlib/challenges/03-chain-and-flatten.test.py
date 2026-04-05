from solution import flatten_lists, merge_dicts, interleave


def test_flatten_lists_basic():
    assert flatten_lists([[1, 2], [3], [4, 5]]) == [1, 2, 3, 4, 5]


def test_flatten_lists_empty_sublists():
    assert flatten_lists([[], [1], [], [2, 3], []]) == [1, 2, 3]


def test_flatten_lists_single():
    assert flatten_lists([[1, 2, 3]]) == [1, 2, 3]


def test_flatten_lists_empty():
    assert flatten_lists([]) == []


def test_flatten_lists_all_empty():
    assert flatten_lists([[], [], []]) == []


def test_flatten_lists_strings():
    assert flatten_lists([["a", "b"], ["c"]]) == ["a", "b", "c"]


def test_merge_dicts_basic():
    result = merge_dicts({"a": 1}, {"b": 2, "a": 3})
    assert result == {"a": 3, "b": 2}


def test_merge_dicts_no_overlap():
    result = merge_dicts({"a": 1}, {"b": 2})
    assert result == {"a": 1, "b": 2}


def test_merge_dicts_three_dicts():
    result = merge_dicts({"a": 1}, {"b": 2}, {"a": 10, "c": 3})
    assert result == {"a": 10, "b": 2, "c": 3}


def test_merge_dicts_single():
    result = merge_dicts({"x": 42})
    assert result == {"x": 42}


def test_merge_dicts_empty():
    result = merge_dicts({}, {})
    assert result == {}


def test_merge_dicts_later_wins():
    result = merge_dicts({"k": "first"}, {"k": "second"}, {"k": "third"})
    assert result == {"k": "third"}


def test_interleave_basic():
    assert interleave([1, 2, 3], ["a", "b", "c"]) == [1, "a", 2, "b", 3, "c"]


def test_interleave_different_lengths_a_longer():
    assert interleave([1, 2, 3], ["a"]) == [1, "a"]


def test_interleave_different_lengths_b_longer():
    assert interleave([1], ["a", "b", "c"]) == [1, "a"]


def test_interleave_empty():
    assert interleave([], []) == []


def test_interleave_one_empty():
    assert interleave([1, 2], []) == []


def test_interleave_single_elements():
    assert interleave([1], [2]) == [1, 2]
