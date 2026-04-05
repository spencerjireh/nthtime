from solution import backspace_compare


def test_basic_match():
    assert backspace_compare("ab#c", "ad#c") is True


def test_both_empty_after_backspace():
    assert backspace_compare("ab##", "c#d#") is True


def test_no_match():
    assert backspace_compare("a#c", "b") is False


def test_both_empty():
    assert backspace_compare("", "") is True


def test_identical_no_backspace():
    assert backspace_compare("a", "a") is True


def test_multiple_backspaces():
    assert backspace_compare("abc###", "") is True


def test_trailing_backspace_no_effect():
    assert backspace_compare("#a", "a") is True
