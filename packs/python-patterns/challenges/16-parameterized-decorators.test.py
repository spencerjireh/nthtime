import pytest
from solution import retry, validate_types


def test_retry_succeeds_first_try():
    @retry(max_attempts=3)
    def always_works():
        return "ok"

    assert always_works() == "ok"


def test_retry_succeeds_on_second_attempt():
    counter = {"count": 0}

    @retry(max_attempts=3)
    def flaky():
        counter["count"] += 1
        if counter["count"] < 2:
            raise ValueError("not yet")
        return "ok"

    assert flaky() == "ok"
    assert counter["count"] == 2


def test_retry_exhausts_attempts_and_raises():
    @retry(max_attempts=3)
    def always_fails():
        raise ValueError("always fails")

    with pytest.raises(ValueError, match="always fails"):
        always_fails()


def test_retry_custom_max_attempts():
    counter = {"count": 0}

    @retry(max_attempts=5)
    def flaky():
        counter["count"] += 1
        if counter["count"] < 5:
            raise RuntimeError("not yet")
        return "done"

    assert flaky() == "done"
    assert counter["count"] == 5


def test_validate_types_passes_valid():
    @validate_types(x=int, y=str)
    def process(x, y):
        return f"{y}: {x}"

    assert process(x=1, y="count") == "count: 1"


def test_validate_types_raises_type_error():
    @validate_types(x=int, y=str)
    def process(x, y):
        return f"{y}: {x}"

    with pytest.raises(TypeError):
        process(x="bad", y="count")


def test_validate_types_checks_multiple_args():
    @validate_types(a=int, b=float)
    def compute(a, b):
        return a + b

    with pytest.raises(TypeError):
        compute(a=1, b="not a float")


def test_validate_types_ignores_unchecked_args():
    @validate_types(x=int)
    def process(x, y):
        return (x, y)

    assert process(x=1, y="anything") == (1, "anything")
