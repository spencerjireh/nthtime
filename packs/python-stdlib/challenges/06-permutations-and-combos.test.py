from solution import all_arrangements, combo_with_replacement, power_set


def test_all_arrangements_basic():
    result = all_arrangements([1, 2, 3])
    assert result == [
        (1, 2, 3), (1, 3, 2),
        (2, 1, 3), (2, 3, 1),
        (3, 1, 2), (3, 2, 1),
    ]


def test_all_arrangements_two():
    result = all_arrangements(["a", "b"])
    assert result == [("a", "b"), ("b", "a")]


def test_all_arrangements_single():
    assert all_arrangements([1]) == [(1,)]


def test_all_arrangements_empty():
    assert all_arrangements([]) == [()]


def test_all_arrangements_count():
    result = all_arrangements([1, 2, 3, 4])
    assert len(result) == 24


def test_all_arrangements_returns_tuples():
    result = all_arrangements([1, 2])
    for item in result:
        assert isinstance(item, tuple)


def test_combo_with_replacement_basic():
    result = combo_with_replacement(["a", "b"], 2)
    assert result == [("a", "a"), ("a", "b"), ("b", "b")]


def test_combo_with_replacement_numbers():
    result = combo_with_replacement([1, 2, 3], 2)
    assert result == [(1, 1), (1, 2), (1, 3), (2, 2), (2, 3), (3, 3)]


def test_combo_with_replacement_size_one():
    result = combo_with_replacement([1, 2, 3], 1)
    assert result == [(1,), (2,), (3,)]


def test_combo_with_replacement_size_three():
    result = combo_with_replacement(["x", "y"], 3)
    assert result == [
        ("x", "x", "x"),
        ("x", "x", "y"),
        ("x", "y", "y"),
        ("y", "y", "y"),
    ]


def test_combo_with_replacement_single_item():
    result = combo_with_replacement(["a"], 3)
    assert result == [("a", "a", "a")]


def test_combo_with_replacement_size_zero():
    result = combo_with_replacement([1, 2], 0)
    assert result == [()]


def test_power_set_basic():
    result = power_set([1, 2])
    assert result == [(), (1,), (2,), (1, 2)]


def test_power_set_three():
    result = power_set([1, 2, 3])
    assert result == [
        (),
        (1,), (2,), (3,),
        (1, 2), (1, 3), (2, 3),
        (1, 2, 3),
    ]


def test_power_set_empty():
    assert power_set([]) == [()]


def test_power_set_single():
    assert power_set(["a"]) == [(), ("a",)]


def test_power_set_count():
    result = power_set([1, 2, 3, 4])
    assert len(result) == 16


def test_power_set_includes_empty_and_full():
    items = [10, 20, 30]
    result = power_set(items)
    assert () in result
    assert (10, 20, 30) in result


def test_power_set_strings():
    result = power_set(["x", "y"])
    assert result == [(), ("x",), ("y",), ("x", "y")]
