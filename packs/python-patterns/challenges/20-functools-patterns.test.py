import pytest
from solution import Registry, chain_predicates, once


def test_registry_register_and_dispatch():
    reg = Registry()

    @reg.register("greet")
    def greet(name):
        return f"Hello, {name}"

    assert reg.dispatch("greet", "Alice") == "Hello, Alice"


def test_registry_multiple_handlers():
    reg = Registry()

    @reg.register("add")
    def add(a, b):
        return a + b

    @reg.register("mul")
    def mul(a, b):
        return a * b

    assert reg.dispatch("add", 2, 3) == 5
    assert reg.dispatch("mul", 2, 3) == 6


def test_registry_dispatch_unknown_raises_key_error():
    reg = Registry()

    with pytest.raises(KeyError, match="No handler for 'missing'"):
        reg.dispatch("missing")


def test_registry_register_returns_original_function():
    reg = Registry()

    @reg.register("fn")
    def my_func():
        return 42

    assert my_func() == 42


def test_chain_predicates_all_pass():
    is_positive = lambda x: x > 0
    is_even = lambda x: x % 2 == 0
    check = chain_predicates(is_positive, is_even)
    assert check(4) is True


def test_chain_predicates_one_fails():
    is_positive = lambda x: x > 0
    is_even = lambda x: x % 2 == 0
    check = chain_predicates(is_positive, is_even)
    assert check(-2) is False
    assert check(3) is False


def test_chain_predicates_empty():
    check = chain_predicates()
    assert check(42) is True


def test_chain_predicates_single():
    is_positive = lambda x: x > 0
    check = chain_predicates(is_positive)
    assert check(1) is True
    assert check(-1) is False


def test_once_calls_fn_only_once():
    counter = {"n": 0}

    @once
    def init():
        counter["n"] += 1
        return 42

    assert init() == 42
    assert init() == 42
    assert init() == 42
    assert counter["n"] == 1


def test_once_returns_cached_result():
    @once
    def compute():
        return "result"

    assert compute() == "result"
    assert compute() == "result"


def test_once_preserves_name():
    @once
    def my_func():
        pass

    assert my_func.__name__ == "my_func"
