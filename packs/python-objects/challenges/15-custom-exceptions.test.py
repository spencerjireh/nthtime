import pytest
from solution import ValidationError, InsufficientFundsError, validate_user


def test_validation_error_attributes():
    err = ValidationError("name", "is required")
    assert err.field == "name"
    assert err.message == "is required"


def test_validation_error_is_exception():
    err = ValidationError("email", "invalid format")
    assert isinstance(err, Exception)


def test_validation_error_str():
    err = ValidationError("name", "is required")
    assert "name" in str(err)


def test_insufficient_funds_attributes():
    err = InsufficientFundsError(100, 50)
    assert err.amount == 100
    assert err.balance == 50


def test_insufficient_funds_is_value_error():
    err = InsufficientFundsError(200, 100)
    assert isinstance(err, ValueError)


def test_validate_user_valid():
    assert validate_user({"name": "Alice", "age": 30}) is True


def test_validate_user_missing_name():
    with pytest.raises(ValidationError) as exc_info:
        validate_user({"age": 25})
    assert exc_info.value.field == "name"


def test_validate_user_empty_name():
    with pytest.raises(ValidationError) as exc_info:
        validate_user({"name": "", "age": 25})
    assert exc_info.value.field == "name"


def test_validate_user_bad_age_type():
    with pytest.raises(ValidationError) as exc_info:
        validate_user({"name": "Alice", "age": "thirty"})
    assert exc_info.value.field == "age"


def test_validate_user_negative_age():
    with pytest.raises(ValidationError) as exc_info:
        validate_user({"name": "Alice", "age": -5})
    assert exc_info.value.field == "age"


def test_validate_user_missing_age():
    with pytest.raises(ValidationError) as exc_info:
        validate_user({"name": "Alice"})
    assert exc_info.value.field == "age"
