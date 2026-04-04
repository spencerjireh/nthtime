import pytest
from solution import BankAccount


def test_create_account():
    account = BankAccount("Alice", 100)
    assert account.owner == "Alice"
    assert account.get_balance() == 100


def test_default_balance():
    account = BankAccount("Bob")
    assert account.get_balance() == 0


def test_deposit():
    account = BankAccount("Alice", 100)
    account.deposit(50)
    assert account.get_balance() == 150


def test_withdraw():
    account = BankAccount("Alice", 100)
    account.withdraw(30)
    assert account.get_balance() == 70


def test_withdraw_insufficient_funds():
    account = BankAccount("Alice", 50)
    with pytest.raises(ValueError):
        account.withdraw(100)


def test_multiple_operations():
    account = BankAccount("Alice")
    account.deposit(200)
    account.withdraw(50)
    account.deposit(25)
    assert account.get_balance() == 175
