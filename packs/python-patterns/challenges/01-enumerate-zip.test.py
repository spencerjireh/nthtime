from solution import indexed_items, pair_up, numbered_lines


def test_indexed_items_basic():
    assert indexed_items(["apple", "banana"]) == ["0: apple", "1: banana"]


def test_indexed_items_single():
    assert indexed_items(["only"]) == ["0: only"]


def test_indexed_items_empty():
    assert indexed_items([]) == []


def test_pair_up_basic():
    assert pair_up(["a", "b"], [1, 2]) == {"a": 1, "b": 2}


def test_pair_up_single():
    assert pair_up(["key"], ["value"]) == {"key": "value"}


def test_pair_up_empty():
    assert pair_up([], []) == {}


def test_numbered_lines_basic():
    assert numbered_lines("hello\nworld") == "1: hello\n2: world"


def test_numbered_lines_single():
    assert numbered_lines("only line") == "1: only line"


def test_numbered_lines_three():
    result = numbered_lines("a\nb\nc")
    assert result == "1: a\n2: b\n3: c"
