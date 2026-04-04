from solution import flatten_deep, path_set, collect_leaves


def test_flatten_deep_shallow():
    assert flatten_deep([1, [2, 3]]) == [1, 2, 3]


def test_flatten_deep_deep():
    assert flatten_deep([1, [2, [3, [4]]]]) == [1, 2, 3, 4]


def test_flatten_deep_empty():
    assert flatten_deep([]) == []


def test_flatten_deep_already_flat():
    assert flatten_deep([1, 2, 3]) == [1, 2, 3]


def test_flatten_deep_mixed_types():
    assert flatten_deep([1, ["a", [True, [None]]]]) == [1, "a", True, None]


def test_flatten_deep_nested_empty():
    assert flatten_deep([[], [[]], [1, []]]) == [1]


def test_path_set_new_path():
    assert path_set({}, "a.b.c", 1) == {"a": {"b": {"c": 1}}}


def test_path_set_existing_partial():
    d = {"a": {"x": 10}}
    result = path_set(d, "a.b", 2)
    assert result == {"a": {"x": 10, "b": 2}}


def test_path_set_overwrite():
    d = {"a": {"b": 1}}
    result = path_set(d, "a.b", 99)
    assert result == {"a": {"b": 99}}


def test_path_set_single_key():
    assert path_set({}, "x", 42) == {"x": 42}


def test_path_set_deep():
    result = path_set({}, "a.b.c.d.e", "deep")
    assert result == {"a": {"b": {"c": {"d": {"e": "deep"}}}}}


def test_collect_leaves_dict_only():
    assert collect_leaves({"a": 1, "b": 2}) == [1, 2]


def test_collect_leaves_list_only():
    assert collect_leaves([1, 2, 3]) == [1, 2, 3]


def test_collect_leaves_mixed():
    result = collect_leaves({"a": [1, {"b": 2}], "c": 3})
    assert sorted(result) == [1, 2, 3]


def test_collect_leaves_deeply_nested():
    tree = {"a": {"b": {"c": 42}}}
    assert collect_leaves(tree) == [42]


def test_collect_leaves_empty_dict():
    assert collect_leaves({}) == []


def test_collect_leaves_empty_list():
    assert collect_leaves([]) == []


def test_collect_leaves_single_value():
    assert collect_leaves(5) == [5]


def test_collect_leaves_strings():
    result = collect_leaves({"x": ["hello", {"y": "world"}]})
    assert result == ["hello", "world"]
