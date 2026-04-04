import pytest
import warnings
from solution import cache_result, require_auth, deprecated


def test_cache_result_returns_correct_value():
    @cache_result
    def square(x):
        return x * x

    assert square(4) == 16
    assert square(5) == 25


def test_cache_result_caches_repeated_calls():
    call_count = {"n": 0}

    @cache_result
    def expensive(x):
        call_count["n"] += 1
        return x * 2

    expensive(3)
    expensive(3)
    assert call_count["n"] == 1


def test_cache_result_exposes_cache():
    @cache_result
    def add(a, b):
        return a + b

    add(1, 2)
    assert (1, 2) in add.cache
    assert add.cache[(1, 2)] == 3


def test_require_auth_with_valid_role():
    @require_auth("admin")
    def delete_user(uid, user=None):
        return f"deleted {uid}"

    assert delete_user(42, user={"role": "admin"}) == "deleted 42"


def test_require_auth_raises_permission_error():
    @require_auth("admin")
    def delete_user(uid, user=None):
        return f"deleted {uid}"

    with pytest.raises(PermissionError, match="Requires role: admin"):
        delete_user(42, user={"role": "viewer"})


def test_require_auth_raises_when_no_user():
    @require_auth("admin")
    def delete_user(uid, user=None):
        return f"deleted {uid}"

    with pytest.raises(PermissionError):
        delete_user(42)


def test_deprecated_warns_on_first_call():
    @deprecated("Use new_func instead")
    def old_func():
        return 1

    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        old_func()
        assert len(w) == 1
        assert issubclass(w[0].category, DeprecationWarning)
        assert "old_func" in str(w[0].message)


def test_deprecated_warns_only_once():
    @deprecated("Use new_func instead")
    def old_func():
        return 1

    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        old_func()
        old_func()
        old_func()
        assert len(w) == 1


def test_deprecated_returns_correct_result():
    @deprecated("old")
    def compute(x):
        return x + 1

    with warnings.catch_warnings(record=True):
        warnings.simplefilter("always")
        assert compute(5) == 6
