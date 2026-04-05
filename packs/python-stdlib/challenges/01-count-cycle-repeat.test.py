from solution import take_from_count, cycle_items, repeat_value


def test_take_from_count_basic():
    assert take_from_count(5, 4) == [5, 6, 7, 8]


def test_take_from_count_from_zero():
    assert take_from_count(0, 3) == [0, 1, 2]


def test_take_from_count_negative_start():
    assert take_from_count(-2, 5) == [-2, -1, 0, 1, 2]


def test_take_from_count_zero_items():
    assert take_from_count(10, 0) == []


def test_take_from_count_single():
    assert take_from_count(42, 1) == [42]


def test_cycle_items_basic():
    assert cycle_items(["a", "b"], 5) == ["a", "b", "a", "b", "a"]


def test_cycle_items_exact_multiple():
    assert cycle_items([1, 2, 3], 6) == [1, 2, 3, 1, 2, 3]


def test_cycle_items_single_element():
    assert cycle_items(["x"], 4) == ["x", "x", "x", "x"]


def test_cycle_items_fewer_than_source():
    assert cycle_items([1, 2, 3, 4], 2) == [1, 2]


def test_cycle_items_zero():
    assert cycle_items([1, 2], 0) == []


def test_repeat_value_basic():
    assert repeat_value(0, 3) == [0, 0, 0]


def test_repeat_value_string():
    assert repeat_value("hello", 2) == ["hello", "hello"]


def test_repeat_value_zero_times():
    assert repeat_value("x", 0) == []


def test_repeat_value_single():
    assert repeat_value(99, 1) == [99]


def test_repeat_value_none():
    assert repeat_value(None, 3) == [None, None, None]
