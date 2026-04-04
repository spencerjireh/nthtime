from solution import invert_dict, merge_dicts, count_chars


def test_invert_dict_basic():
    assert invert_dict({"a": 1, "b": 2}) == {1: "a", 2: "b"}


def test_invert_dict_empty():
    assert invert_dict({}) == {}


def test_invert_dict_single():
    assert invert_dict({"x": 10}) == {10: "x"}


def test_merge_dicts_two():
    assert merge_dicts({"a": 1}, {"b": 2}) == {"a": 1, "b": 2}


def test_merge_dicts_three():
    assert merge_dicts({"a": 1}, {"b": 2}, {"c": 3}) == {"a": 1, "b": 2, "c": 3}


def test_merge_dicts_override():
    assert merge_dicts({"a": 1}, {"a": 2}) == {"a": 2}


def test_merge_dicts_empty():
    assert merge_dicts() == {}


def test_merge_dicts_single():
    assert merge_dicts({"a": 1}) == {"a": 1}


def test_count_chars_basic():
    assert count_chars("abc") == {"a": 1, "b": 1, "c": 1}


def test_count_chars_repeated():
    assert count_chars("aabbc") == {"a": 2, "b": 2, "c": 1}


def test_count_chars_empty():
    assert count_chars("") == {}


def test_count_chars_spaces():
    assert count_chars("a b") == {"a": 1, " ": 1, "b": 1}
