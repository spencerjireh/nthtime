import pytest
from solution import collect_errors, retry_on, null_safe


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


def test_retry_on_succeeds_first_try():
    call_count = 0

    @retry_on((ValueError,), max_retries=3)
    def good():
        nonlocal call_count
        call_count += 1
        return "ok"

    assert good() == "ok"
    assert call_count == 1


def test_retry_on_succeeds_after_retry():
    call_count = 0

    @retry_on((ValueError,), max_retries=3)
    def flaky():
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise ValueError("not yet")
        return "done"

    assert flaky() == "done"
    assert call_count == 3


def test_retry_on_exhausts_retries():
    @retry_on((ValueError,), max_retries=2)
    def always_fail():
        raise ValueError("always")

    with pytest.raises(ValueError):
        always_fail()


def test_retry_on_does_not_catch_other_exceptions():
    @retry_on((ValueError,), max_retries=3)
    def wrong_error():
        raise TypeError("wrong type")

    with pytest.raises(TypeError):
        wrong_error()


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
