from solution import is_subsequence


def test_basic_subsequence():
    assert is_subsequence("abc", "ahbgdc") is True


def test_not_subsequence():
    assert is_subsequence("axc", "ahbgdc") is False


def test_empty_s():
    assert is_subsequence("", "ahbgdc") is True


def test_nonempty_s_empty_t():
    assert is_subsequence("abc", "") is False


def test_single_char_found():
    assert is_subsequence("b", "abc") is True


def test_both_empty():
    assert is_subsequence("", "") is True


def test_identical_strings():
    assert is_subsequence("abc", "abc") is True
