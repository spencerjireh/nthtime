from solution import is_palindrome


def test_sentence_palindrome():
    assert is_palindrome("A man, a plan, a canal: Panama") is True


def test_not_palindrome():
    assert is_palindrome("race a car") is False


def test_empty_like_string():
    assert is_palindrome(" ") is True


def test_mixed_case_digits():
    assert is_palindrome("0P") is False


def test_empty_string():
    assert is_palindrome("") is True


def test_single_char():
    assert is_palindrome("a") is True


def test_punctuation_only():
    assert is_palindrome(".,!") is True
