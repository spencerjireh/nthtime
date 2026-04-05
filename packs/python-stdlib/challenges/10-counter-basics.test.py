from collections import Counter
from solution import word_frequencies, most_common_chars, subtract_inventories


def test_word_frequencies_basic():
    result = word_frequencies('the cat and the dog')
    assert result == Counter({'the': 2, 'cat': 1, 'and': 1, 'dog': 1})


def test_word_frequencies_single_word():
    result = word_frequencies('hello')
    assert result == Counter({'hello': 1})


def test_word_frequencies_empty():
    result = word_frequencies('')
    assert result == Counter()


def test_word_frequencies_case_insensitive():
    result = word_frequencies('Hello hello HELLO')
    assert result == Counter({'hello': 3})


def test_word_frequencies_returns_counter():
    result = word_frequencies('a b c')
    assert isinstance(result, Counter)


def test_most_common_chars_basic():
    result = most_common_chars('hello world', 3)
    assert result == ['l', 'o', 'h']


def test_most_common_chars_ignores_spaces():
    result = most_common_chars('a a a b b', 2)
    assert result == ['a', 'b']


def test_most_common_chars_single():
    result = most_common_chars('aaa', 1)
    assert result == ['a']


def test_most_common_chars_all():
    result = most_common_chars('abc', 3)
    assert len(result) == 3


def test_most_common_chars_returns_chars_not_counts():
    result = most_common_chars('aabb', 2)
    for item in result:
        assert isinstance(item, str)
        assert len(item) == 1


def test_subtract_inventories_basic():
    result = subtract_inventories({'apples': 5, 'bananas': 3}, {'apples': 2, 'bananas': 3})
    assert result == {'apples': 3}


def test_subtract_inventories_all_used():
    result = subtract_inventories({'apples': 3}, {'apples': 3})
    assert result == {}


def test_subtract_inventories_nothing_used():
    result = subtract_inventories({'apples': 5}, {})
    assert result == {'apples': 5}


def test_subtract_inventories_empty_have():
    result = subtract_inventories({}, {'apples': 2})
    assert result == {}


def test_subtract_inventories_drops_zero_and_negative():
    result = subtract_inventories({'a': 2, 'b': 1}, {'a': 2, 'b': 5})
    assert result == {}


def test_subtract_inventories_returns_dict():
    result = subtract_inventories({'x': 3}, {'x': 1})
    assert isinstance(result, dict)
