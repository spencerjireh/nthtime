from solution import add, repeat, first_or_default


def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
    assert add(0, 0) == 0


def test_repeat_default():
    assert repeat("ha") == "haha"
    assert repeat("ab") == "abab"


def test_repeat_custom():
    assert repeat("ha", 3) == "hahaha"
    assert repeat("x", 5) == "xxxxx"
    assert repeat("hi", 1) == "hi"


def test_first_or_default_with_items():
    assert first_or_default(["a", "b", "c"]) == "a"
    assert first_or_default(["only"]) == "only"


def test_first_or_default_empty():
    assert first_or_default([]) == ""


def test_first_or_default_custom_default():
    assert first_or_default([], "fallback") == "fallback"
    assert first_or_default([], "N/A") == "N/A"
