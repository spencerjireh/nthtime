import pytest
from solution import process_payment, lookup_user


def test_process_payment_valid():
    assert process_payment(49.99) == "USD 49.99"
    assert process_payment(100) == "USD 100.00"
    assert process_payment(0.5) == "USD 0.50"


def test_process_payment_zero():
    assert process_payment(0) == "zero"


def test_process_payment_negative():
    with pytest.raises(ValueError, match="Amount cannot be negative"):
        process_payment(-5)


def test_process_payment_custom_currency():
    assert process_payment(100, "EUR") == "EUR 100.00"
    assert process_payment(25.5, "GBP") == "GBP 25.50"


def test_lookup_user_found():
    users = {"alice": "Admin", "bob": "User"}
    assert lookup_user(users, "alice") == "Admin"
    assert lookup_user(users, "bob") == "User"


def test_lookup_user_empty_dict():
    assert lookup_user({}, "alice") is None


def test_lookup_user_missing():
    users = {"alice": "Admin"}
    with pytest.raises(KeyError, match="User bob not found"):
        lookup_user(users, "bob")
