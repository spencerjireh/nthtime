from solution import poker_hands, bounded_history, multidict_merge


def test_poker_hands_basic():
    result = poker_hands(["A", "K", "Q"], 2)
    assert result == [("A", "K"), ("A", "Q"), ("K", "Q")]


def test_poker_hands_single():
    result = poker_hands(["A", "K", "Q"], 1)
    assert result == [("A",), ("K",), ("Q",)]


def test_poker_hands_full():
    result = poker_hands(["A", "K", "Q"], 3)
    assert result == [("A", "K", "Q")]


def test_poker_hands_empty():
    result = poker_hands([], 2)
    assert result == []


def test_poker_hands_hand_larger_than_deck():
    result = poker_hands(["A", "K"], 5)
    assert result == []


def test_poker_hands_count():
    result = poker_hands([1, 2, 3, 4, 5], 3)
    assert len(result) == 10


def test_poker_hands_tuples():
    result = poker_hands(["A", "K"], 2)
    assert all(isinstance(hand, tuple) for hand in result)


def test_bounded_history_basic():
    h = bounded_history(3)
    h.append("a")
    h.append("b")
    h.append("c")
    assert h.items() == ["a", "b", "c"]


def test_bounded_history_overflow():
    h = bounded_history(3)
    h.append("a")
    h.append("b")
    h.append("c")
    h.append("d")
    assert h.items() == ["b", "c", "d"]


def test_bounded_history_empty():
    h = bounded_history(5)
    assert h.items() == []


def test_bounded_history_single_slot():
    h = bounded_history(1)
    h.append("x")
    h.append("y")
    assert h.items() == ["y"]


def test_bounded_history_partial_fill():
    h = bounded_history(5)
    h.append(1)
    h.append(2)
    assert h.items() == [1, 2]


def test_bounded_history_returns_list():
    h = bounded_history(3)
    h.append("a")
    result = h.items()
    assert isinstance(result, list)


def test_multidict_merge_basic():
    result = multidict_merge({"a": 1, "b": 2}, {"a": 3, "c": 4})
    assert result == {"a": [1, 3], "b": [2], "c": [4]}


def test_multidict_merge_no_overlap():
    result = multidict_merge({"a": 1}, {"b": 2})
    assert result == {"a": [1], "b": [2]}


def test_multidict_merge_three_dicts():
    result = multidict_merge({"x": 1}, {"x": 2}, {"x": 3, "y": 4})
    assert result == {"x": [1, 2, 3], "y": [4]}


def test_multidict_merge_empty():
    assert multidict_merge() == {}


def test_multidict_merge_single_dict():
    result = multidict_merge({"a": 1, "b": 2})
    assert result == {"a": [1], "b": [2]}


def test_multidict_merge_empty_dicts():
    result = multidict_merge({}, {}, {"a": 1})
    assert result == {"a": [1]}


def test_multidict_merge_preserves_order():
    result = multidict_merge({"a": 10}, {"a": 20}, {"a": 30})
    assert result["a"] == [10, 20, 30]
