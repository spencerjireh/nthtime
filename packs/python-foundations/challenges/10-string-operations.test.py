from solution import snake_to_camel, truncate, count_vowels


def test_snake_to_camel_basic():
    assert snake_to_camel("hello_world") == "helloWorld"


def test_snake_to_camel_no_underscore():
    assert snake_to_camel("hello") == "hello"


def test_snake_to_camel_multiple():
    assert snake_to_camel("one_two_three_four") == "oneTwoThreeFour"


def test_snake_to_camel_single_char_words():
    assert snake_to_camel("a_b_c") == "aBC"


def test_truncate_short_text():
    assert truncate("Hi", 10) == "Hi"


def test_truncate_exact_length():
    assert truncate("Hello", 5) == "Hello"


def test_truncate_long_text():
    assert truncate("Hello, World!", 8) == "Hello..."


def test_truncate_custom_suffix():
    assert truncate("Hello, World!", 9, suffix="~") == "Hello, W~"


def test_count_vowels_basic():
    assert count_vowels("hello") == 2


def test_count_vowels_mixed_case():
    assert count_vowels("AEIOU") == 5


def test_count_vowels_no_vowels():
    assert count_vowels("bcdfg") == 0


def test_count_vowels_empty():
    assert count_vowels("") == 0
