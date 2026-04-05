from solution import word_count_pipeline, csv_aggregate, top_cooccurrences


def test_word_count_pipeline_basic():
    result = word_count_pipeline("the cat sat on the mat the cat")
    assert result[0] == ("the", 3)
    assert result[1] == ("cat", 2)
    assert len(result) == 3


def test_word_count_pipeline_case_insensitive():
    result = word_count_pipeline("Hello hello HELLO world")
    assert result[0] == ("hello", 3)


def test_word_count_pipeline_fewer_than_three():
    result = word_count_pipeline("one one two")
    assert result == [("one", 2), ("two", 1)]


def test_word_count_pipeline_single_word():
    result = word_count_pipeline("only")
    assert result == [("only", 1)]


def test_word_count_pipeline_empty():
    result = word_count_pipeline("")
    assert result == []


def test_word_count_pipeline_all_same():
    result = word_count_pipeline("go go go go")
    assert result == [("go", 4)]


def test_csv_aggregate_basic():
    rows = [
        {"dept": "eng", "cost": 100},
        {"dept": "eng", "cost": 200},
        {"dept": "hr", "cost": 50},
    ]
    result = csv_aggregate(rows, "dept", "cost")
    assert result == {"eng": 300, "hr": 50}


def test_csv_aggregate_single_group():
    rows = [
        {"team": "a", "points": 10},
        {"team": "a", "points": 20},
    ]
    result = csv_aggregate(rows, "team", "points")
    assert result == {"a": 30}


def test_csv_aggregate_empty():
    assert csv_aggregate([], "dept", "cost") == {}


def test_csv_aggregate_single_row():
    rows = [{"category": "x", "amount": 42}]
    result = csv_aggregate(rows, "category", "amount")
    assert result == {"x": 42}


def test_csv_aggregate_many_groups():
    rows = [
        {"color": "red", "count": 1},
        {"color": "blue", "count": 2},
        {"color": "red", "count": 3},
        {"color": "green", "count": 4},
        {"color": "blue", "count": 5},
    ]
    result = csv_aggregate(rows, "color", "count")
    assert result == {"red": 4, "blue": 7, "green": 4}


def test_top_cooccurrences_basic():
    pairs = [("a", "b"), ("b", "a"), ("a", "c")]
    result = top_cooccurrences(pairs, 2)
    assert result[0] == (frozenset({"a", "b"}), 2)
    assert result[1] == (frozenset({"a", "c"}), 1)


def test_top_cooccurrences_all_same():
    pairs = [("x", "y"), ("y", "x"), ("x", "y")]
    result = top_cooccurrences(pairs, 1)
    assert result == [(frozenset({"x", "y"}), 3)]


def test_top_cooccurrences_empty():
    assert top_cooccurrences([], 5) == []


def test_top_cooccurrences_limit():
    pairs = [("a", "b"), ("c", "d"), ("e", "f")]
    result = top_cooccurrences(pairs, 2)
    assert len(result) == 2


def test_top_cooccurrences_single_pair():
    pairs = [("hello", "world")]
    result = top_cooccurrences(pairs, 5)
    assert result == [(frozenset({"hello", "world"}), 1)]


def test_top_cooccurrences_symmetry():
    pairs = [("a", "b"), ("b", "a")]
    result = top_cooccurrences(pairs, 1)
    assert result[0][1] == 2
    assert result[0][0] == frozenset({"a", "b"})
