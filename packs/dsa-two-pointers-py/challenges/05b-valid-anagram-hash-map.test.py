from solution import is_anagram


def test_basic_anagram():
    assert is_anagram("anagram", "nagaram") is True


def test_not_anagram():
    assert is_anagram("rat", "car") is False


def test_both_empty():
    assert is_anagram("", "") is True


def test_different_lengths():
    assert is_anagram("a", "ab") is False


def test_same_chars_different_counts():
    assert is_anagram("aab", "abb") is False


def test_single_char_match():
    assert is_anagram("z", "z") is True


def test_repeated_chars():
    assert is_anagram("aacc", "ccaa") is True
