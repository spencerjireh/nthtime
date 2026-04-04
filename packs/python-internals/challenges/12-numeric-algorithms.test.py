import pytest
from solution import gcd, fast_pow, integer_sqrt


def test_gcd_basic():
    assert gcd(12, 8) == 4


def test_gcd_coprime():
    assert gcd(17, 5) == 1


def test_gcd_zero_first():
    assert gcd(0, 5) == 5


def test_gcd_zero_second():
    assert gcd(5, 0) == 5


def test_gcd_equal():
    assert gcd(7, 7) == 7


def test_gcd_negative():
    assert gcd(-12, 8) == 4


def test_gcd_large():
    assert gcd(48, 36) == 12


def test_fast_pow_basic():
    assert fast_pow(2, 10, 1000) == 24


def test_fast_pow_modular():
    assert fast_pow(3, 7, 13) == 3


def test_fast_pow_zero_exp():
    assert fast_pow(5, 0, 7) == 1


def test_fast_pow_one_exp():
    assert fast_pow(5, 1, 7) == 5


def test_fast_pow_large():
    assert fast_pow(2, 20, 1000000) == 48576


def test_integer_sqrt_zero():
    assert integer_sqrt(0) == 0


def test_integer_sqrt_one():
    assert integer_sqrt(1) == 1


def test_integer_sqrt_perfect():
    assert integer_sqrt(16) == 4


def test_integer_sqrt_non_perfect():
    assert integer_sqrt(17) == 4


def test_integer_sqrt_large():
    assert integer_sqrt(100) == 10


def test_integer_sqrt_large_non_perfect():
    assert integer_sqrt(99) == 9


def test_integer_sqrt_negative():
    with pytest.raises(ValueError):
        integer_sqrt(-1)
