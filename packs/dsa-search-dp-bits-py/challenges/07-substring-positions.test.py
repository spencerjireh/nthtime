from solution import index_pairs


def test_leetcode_example():
    assert index_pairs("thestoryofleetcodeandme", ["story", "fleet", "leetcode"]) == [
        [3, 7],
        [9, 13],
        [10, 17],
    ]


def test_overlapping():
    assert index_pairs("ababa", ["aba", "ab"]) == [
        [0, 1],
        [0, 2],
        [2, 3],
        [2, 4],
    ]


def test_no_matches():
    assert index_pairs("hello", ["xyz", "abc"]) == []


def test_single_char_words():
    assert index_pairs("abab", ["a"]) == [[0, 0], [2, 2]]


def test_word_equals_text():
    assert index_pairs("hello", ["hello"]) == [[0, 4]]


def test_empty_words():
    assert index_pairs("hello", []) == []
