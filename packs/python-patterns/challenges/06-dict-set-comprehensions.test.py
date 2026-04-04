from solution import word_lengths, unique_chars, index_by


def test_word_lengths_basic():
    assert word_lengths(["hello", "hi"]) == {"hello": 5, "hi": 2}


def test_word_lengths_single():
    assert word_lengths(["test"]) == {"test": 4}


def test_word_lengths_empty():
    assert word_lengths([]) == {}


def test_word_lengths_same_length():
    assert word_lengths(["cat", "dog"]) == {"cat": 3, "dog": 3}


def test_unique_chars_basic():
    result = unique_chars("hello world")
    assert result == {"h", "e", "l", "o", "w", "r", "d"}


def test_unique_chars_no_spaces():
    result = unique_chars("abc")
    assert result == {"a", "b", "c"}


def test_unique_chars_all_spaces():
    result = unique_chars("   ")
    assert result == set()


def test_unique_chars_repeated():
    result = unique_chars("aaa bbb")
    assert result == {"a", "b"}


def test_index_by_basic():
    items = [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
    result = index_by(items, "id")
    assert result == {1: {"id": 1, "name": "Alice"}, 2: {"id": 2, "name": "Bob"}}


def test_index_by_string_key():
    items = [{"slug": "a", "val": 1}, {"slug": "b", "val": 2}]
    result = index_by(items, "slug")
    assert result == {"a": {"slug": "a", "val": 1}, "b": {"slug": "b", "val": 2}}


def test_index_by_empty():
    assert index_by([], "id") == {}


def test_index_by_single():
    items = [{"id": 42, "x": "y"}]
    result = index_by(items, "id")
    assert result == {42: {"id": 42, "x": "y"}}
