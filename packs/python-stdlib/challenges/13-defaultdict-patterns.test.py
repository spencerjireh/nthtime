from solution import word_positions, nested_group, count_by


def test_word_positions_basic():
    result = word_positions("the cat and the dog")
    assert result["the"] == [0, 3]
    assert result["cat"] == [1]
    assert result["and"] == [2]
    assert result["dog"] == [4]


def test_word_positions_single_word():
    assert word_positions("hello") == {"hello": [0]}


def test_word_positions_empty():
    assert word_positions("") == {}


def test_word_positions_repeated():
    result = word_positions("a a a")
    assert result["a"] == [0, 1, 2]


def test_word_positions_all_unique():
    result = word_positions("one two three")
    assert result == {"one": [0], "two": [1], "three": [2]}


def test_nested_group_by_first_letter_and_length():
    result = nested_group(
        ["alice", "bob", "aaron"],
        lambda s: s[0],
        lambda s: len(s),
    )
    assert result["a"][5] == ["alice", "aaron"]
    assert result["b"][3] == ["bob"]


def test_nested_group_empty():
    result = nested_group([], lambda x: x, lambda x: x)
    assert result == {}


def test_nested_group_single_item():
    result = nested_group(
        ["hello"],
        lambda s: s[0],
        lambda s: len(s),
    )
    assert result == {"h": {5: ["hello"]}}


def test_nested_group_numbers():
    result = nested_group(
        [1, 2, 3, 4, 5, 6],
        lambda x: "even" if x % 2 == 0 else "odd",
        lambda x: x > 3,
    )
    assert result["odd"][False] == [1, 3]
    assert result["odd"][True] == [5]
    assert result["even"][False] == [2]
    assert result["even"][True] == [4, 6]


def test_count_by_even_odd():
    result = count_by([1, 2, 3, 4, 5], lambda x: "even" if x % 2 == 0 else "odd")
    assert result["odd"] == 3
    assert result["even"] == 2


def test_count_by_empty():
    assert count_by([], lambda x: x) == {}


def test_count_by_single():
    assert count_by([42], lambda x: "num") == {"num": 1}


def test_count_by_string_length():
    result = count_by(["hi", "hey", "hello", "ha"], lambda s: len(s))
    assert result[2] == 2
    assert result[3] == 1
    assert result[5] == 1
