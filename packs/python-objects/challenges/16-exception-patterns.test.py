import pytest
from solution import collect_errors, error_boundary, null_safe


def test_collect_errors_all_pass():
    def ok(d):
        pass

    assert collect_errors([ok, ok], {"x": 1}) == []


def test_collect_errors_some_fail():
    def fail_name(d):
        if "name" not in d:
            raise ValueError("missing name")

    def fail_age(d):
        if "age" not in d:
            raise ValueError("missing age")

    def ok(d):
        pass

    errors = collect_errors([fail_name, ok, fail_age], {})
    assert len(errors) == 2
    assert all(isinstance(e, ValueError) for e in errors)


def test_collect_errors_all_fail():
    def fail1(d):
        raise TypeError("bad")

    def fail2(d):
        raise RuntimeError("oops")

    errors = collect_errors([fail1, fail2], {})
    assert len(errors) == 2
    assert isinstance(errors[0], TypeError)
    assert isinstance(errors[1], RuntimeError)


def test_error_boundary_no_exception():
    result = error_boundary(lambda: 42, lambda e: -1)
    assert result == 42


def test_error_boundary_handles_exception():
    result = error_boundary(
        lambda: int("abc"),
        lambda e: f"failed: {e}",
    )
    assert "failed:" in result


def test_error_boundary_handler_receives_exception():
    captured = []
    error_boundary(
        lambda: 1 / 0,
        lambda e: captured.append(e),
    )
    assert len(captured) == 1
    assert isinstance(captured[0], ZeroDivisionError)


def test_error_boundary_returns_handler_result():
    result = error_boundary(
        lambda: [][0],
        lambda e: "default",
    )
    assert result == "default"


def test_null_safe_catches_attribute_error():
    @null_safe
    def get_upper(s):
        return s.upper()

    assert get_upper(None) is None


def test_null_safe_catches_type_error():
    @null_safe
    def add(a, b):
        return a + b

    assert add("hello", 5) is None


def test_null_safe_passes_through_normal():
    @null_safe
    def greet(name):
        return f"hello {name}"

    assert greet("world") == "hello world"


def test_null_safe_does_not_catch_value_error():
    @null_safe
    def strict(x):
        if x < 0:
            raise ValueError("negative")
        return x

    with pytest.raises(ValueError):
        strict(-1)
