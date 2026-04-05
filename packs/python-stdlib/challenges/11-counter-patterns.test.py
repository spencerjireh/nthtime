from collections import Counter
from solution import is_anagram, merge_counts, top_n_words


def test_is_anagram_true():
    assert is_anagram('listen', 'silent') is True


def test_is_anagram_false():
    assert is_anagram('hello', 'world') is False


def test_is_anagram_case_insensitive():
    assert is_anagram('Listen', 'Silent') is True


def test_is_anagram_different_lengths():
    assert is_anagram('abc', 'abcd') is False


def test_is_anagram_empty_strings():
    assert is_anagram('', '') is True


def test_is_anagram_single_char():
    assert is_anagram('a', 'a') is True
    assert is_anagram('a', 'b') is False


def test_is_anagram_repeated_chars():
    assert is_anagram('aab', 'aba') is True
    assert is_anagram('aab', 'abb') is False


def test_merge_counts_two():
    result = merge_counts(Counter(a=1, b=2), Counter(a=3, c=1))
    assert result == Counter({'a': 4, 'b': 2, 'c': 1})


def test_merge_counts_three():
    result = merge_counts(Counter(x=1), Counter(x=2), Counter(x=3))
    assert result == Counter({'x': 6})


def test_merge_counts_single():
    result = merge_counts(Counter(a=5))
    assert result == Counter({'a': 5})


def test_merge_counts_no_overlap():
    result = merge_counts(Counter(a=1), Counter(b=2))
    assert result == Counter({'a': 1, 'b': 2})


def test_merge_counts_empty():
    result = merge_counts()
    assert result == Counter()


def test_merge_counts_returns_counter():
    result = merge_counts(Counter(a=1))
    assert isinstance(result, Counter)


def test_top_n_words_basic():
    result = top_n_words(['the cat sat', 'the dog sat on the mat'], 2)
    assert result == ['the', 'sat']


def test_top_n_words_single_text():
    result = top_n_words(['hello hello world'], 1)
    assert result == ['hello']


def test_top_n_words_case_insensitive():
    result = top_n_words(['Hello hello HELLO'], 1)
    assert result == ['hello']


def test_top_n_words_all_unique():
    result = top_n_words(['a b c d'], 4)
    assert len(result) == 4


def test_top_n_words_empty_texts():
    result = top_n_words([], 3)
    assert result == []


def test_top_n_words_returns_words_not_counts():
    result = top_n_words(['the the cat'], 2)
    for item in result:
        assert isinstance(item, str)
