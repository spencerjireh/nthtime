from solution import timer, call_counter
import time


def test_timer_returns_correct_result():
    @timer
    def add(a, b):
        return a + b

    assert add(2, 3) == 5


def test_timer_prints_timing(capsys):
    @timer
    def greet(name):
        return f"Hello, {name}"

    greet("Alice")
    captured = capsys.readouterr()
    assert "greet took" in captured.out


def test_timer_preserves_name():
    @timer
    def my_func():
        pass

    assert my_func.__name__ == "my_func"


def test_call_counter_counts_calls():
    @call_counter
    def greet(name):
        return f"Hello, {name}"

    greet("Alice")
    greet("Bob")
    greet("Charlie")
    assert greet.call_count == 3


def test_call_counter_starts_at_zero():
    @call_counter
    def noop():
        pass

    assert noop.call_count == 0


def test_call_counter_returns_result():
    @call_counter
    def double(x):
        return x * 2

    assert double(5) == 10


def test_call_counter_preserves_name():
    @call_counter
    def my_func():
        pass

    assert my_func.__name__ == "my_func"
