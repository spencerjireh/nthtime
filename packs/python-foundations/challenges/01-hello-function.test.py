from solution import greet, greet_many


def test_greet_basic():
    assert greet("Alice") == "Hello, Alice!"


def test_greet_empty_name():
    assert greet("") == "Hello, !"


def test_greet_many_single():
    assert greet_many(["Alice"]) == "Hello, Alice!"


def test_greet_many_multiple():
    result = greet_many(["Alice", "Bob", "Charlie"])
    assert result == "Hello, Alice!\nHello, Bob!\nHello, Charlie!"


def test_greet_many_empty_list():
    assert greet_many([]) == ""
