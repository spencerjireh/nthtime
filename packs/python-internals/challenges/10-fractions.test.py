from fractions import Fraction
from solution import add_fractions, simplify, to_mixed, harmonic_sum


def test_add_fractions_basic():
    assert add_fractions((1, 2), (1, 3)) == (5, 6)


def test_add_fractions_same_denominator():
    assert add_fractions((1, 4), (1, 4)) == (1, 2)


def test_add_fractions_simplifies():
    assert add_fractions((1, 6), (1, 6)) == (1, 3)


def test_add_fractions_whole_result():
    assert add_fractions((1, 2), (1, 2)) == (1, 1)


def test_simplify_basic():
    assert simplify(4, 8) == (1, 2)


def test_simplify_already_simple():
    assert simplify(3, 7) == (3, 7)


def test_simplify_large_common_factor():
    assert simplify(12, 18) == (2, 3)


def test_simplify_one():
    assert simplify(5, 5) == (1, 1)


def test_to_mixed_basic():
    assert to_mixed(7, 3) == (2, 1, 3)


def test_to_mixed_exact():
    assert to_mixed(6, 3) == (2, 0, 1)


def test_to_mixed_less_than_one():
    assert to_mixed(2, 5) == (0, 2, 5)


def test_to_mixed_simplifies_remainder():
    assert to_mixed(10, 4) == (2, 1, 2)


def test_harmonic_sum_one():
    assert harmonic_sum(1) == Fraction(1, 1)


def test_harmonic_sum_two():
    assert harmonic_sum(2) == Fraction(3, 2)


def test_harmonic_sum_four():
    assert harmonic_sum(4) == Fraction(25, 12)


def test_harmonic_sum_is_fraction():
    result = harmonic_sum(5)
    assert isinstance(result, Fraction)
