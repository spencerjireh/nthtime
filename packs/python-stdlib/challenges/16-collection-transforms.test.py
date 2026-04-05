from solution import frequency_rank, deduplicate_ordered, invert_mapping


def test_frequency_rank_basic():
    result = frequency_rank(["b", "a", "a", "c", "b", "a"])
    assert result == ["a", "a", "a", "b", "b", "c"]


def test_frequency_rank_all_same():
    result = frequency_rank([1, 1, 1])
    assert result == [1, 1, 1]


def test_frequency_rank_all_unique():
    result = frequency_rank([3, 1, 2])
    assert len(result) == 3
    assert set(result) == {1, 2, 3}


def test_frequency_rank_empty():
    assert frequency_rank([]) == []


def test_frequency_rank_single():
    assert frequency_rank([42]) == [42]


def test_frequency_rank_numbers():
    result = frequency_rank([5, 3, 5, 5, 3, 1])
    assert result[:3] == [5, 5, 5]
    assert result[3:5] == [3, 3]
    assert result[5] == 1


def test_deduplicate_ordered_basic():
    assert deduplicate_ordered([3, 1, 2, 1, 3, 4]) == [3, 1, 2, 4]


def test_deduplicate_ordered_no_duplicates():
    assert deduplicate_ordered([1, 2, 3]) == [1, 2, 3]


def test_deduplicate_ordered_all_same():
    assert deduplicate_ordered([5, 5, 5]) == [5]


def test_deduplicate_ordered_empty():
    assert deduplicate_ordered([]) == []


def test_deduplicate_ordered_strings():
    assert deduplicate_ordered(["a", "b", "a", "c", "b"]) == ["a", "b", "c"]


def test_deduplicate_ordered_preserves_first():
    result = deduplicate_ordered([4, 2, 4, 1, 2])
    assert result == [4, 2, 1]


def test_invert_mapping_basic():
    result = invert_mapping({"a": 1, "b": 2, "c": 1})
    assert sorted(result[1]) == ["a", "c"]
    assert result[2] == ["b"]


def test_invert_mapping_unique_values():
    result = invert_mapping({"x": 10, "y": 20})
    assert result == {10: ["x"], 20: ["y"]}


def test_invert_mapping_empty():
    assert invert_mapping({}) == {}


def test_invert_mapping_single():
    assert invert_mapping({"only": 99}) == {99: ["only"]}


def test_invert_mapping_all_same_value():
    result = invert_mapping({"a": 1, "b": 1, "c": 1})
    assert len(result) == 1
    assert sorted(result[1]) == ["a", "b", "c"]


def test_invert_mapping_string_values():
    result = invert_mapping({1: "odd", 2: "even", 3: "odd", 4: "even"})
    assert sorted(result["odd"]) == [1, 3]
    assert sorted(result["even"]) == [2, 4]
