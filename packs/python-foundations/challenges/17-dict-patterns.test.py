from solution import deep_get, group_by, diff_dicts


def test_deep_get_found():
    assert deep_get({"a": {"b": 1}}, "a.b") == 1


def test_deep_get_missing():
    assert deep_get({"a": 1}, "a.b.c") is None


def test_deep_get_missing_with_default():
    assert deep_get({"a": 1}, "a.b.c", "missing") == "missing"


def test_deep_get_nested_three_levels():
    assert deep_get({"a": {"b": {"c": 42}}}, "a.b.c") == 42


def test_deep_get_top_level():
    assert deep_get({"x": 10}, "x") == 10


def test_deep_get_empty_dict():
    assert deep_get({}, "a") is None


def test_group_by_by_length():
    result = group_by(["hi", "hey", "bye", "ok"], len)
    assert result == {2: ["hi", "ok"], 3: ["hey", "bye"]}


def test_group_by_by_first_char():
    result = group_by(["apple", "avocado", "banana"], lambda s: s[0])
    assert result == {"a": ["apple", "avocado"], "b": ["banana"]}


def test_group_by_empty():
    assert group_by([], len) == {}


def test_group_by_single_group():
    result = group_by(["aa", "bb", "cc"], len)
    assert result == {2: ["aa", "bb", "cc"]}


def test_diff_dicts_added():
    result = diff_dicts({"a": 1}, {"a": 1, "b": 2})
    assert result["added"] == {"b": 2}
    assert result["removed"] == {}
    assert result["changed"] == {}


def test_diff_dicts_removed():
    result = diff_dicts({"a": 1, "b": 2}, {"a": 1})
    assert result["added"] == {}
    assert result["removed"] == {"b": 2}
    assert result["changed"] == {}


def test_diff_dicts_changed():
    result = diff_dicts({"a": 1}, {"a": 2})
    assert result["added"] == {}
    assert result["removed"] == {}
    assert result["changed"] == {"a": 2}


def test_diff_dicts_identical():
    result = diff_dicts({"a": 1}, {"a": 1})
    assert result == {"added": {}, "removed": {}, "changed": {}}


def test_diff_dicts_empty():
    result = diff_dicts({}, {})
    assert result == {"added": {}, "removed": {}, "changed": {}}


def test_diff_dicts_mixed():
    result = diff_dicts({"a": 1, "b": 2}, {"b": 3, "c": 4})
    assert result == {"added": {"c": 4}, "removed": {"a": 1}, "changed": {"b": 3}}
