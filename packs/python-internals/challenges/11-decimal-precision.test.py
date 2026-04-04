from decimal import Decimal
from solution import precise_divide, money_add, round_half_even, compare_float_decimal


def test_precise_divide_one_third():
    result = precise_divide(1, 3, 5)
    assert str(result) == "0.33333"


def test_precise_divide_default_places():
    result = precise_divide(1, 7)
    result_str = str(result)
    assert result_str.startswith("0.142857142")


def test_precise_divide_exact():
    result = precise_divide(1, 4, 2)
    assert float(result) == 0.25


def test_money_add_basic():
    assert money_add(["10.25", "5.75"]) == "16.00"


def test_money_add_single():
    assert money_add(["3.50"]) == "3.50"


def test_money_add_many():
    result = money_add(["1.01", "2.02", "3.03"])
    assert result == "6.06"


def test_money_add_preserves_cents():
    result = money_add(["0.10", "0.20"])
    assert result == "0.30"


def test_round_half_even_rounds_down():
    assert round_half_even(2.5, 0) == 2.0


def test_round_half_even_rounds_up():
    assert round_half_even(3.5, 0) == 4.0


def test_round_half_even_decimal_places():
    assert round_half_even(2.25, 1) == 2.2


def test_round_half_even_no_change():
    assert round_half_even(2.3, 1) == 2.3


def test_compare_float_decimal_unequal():
    result = compare_float_decimal(0.1, 0.2)
    assert result["decimal_sum"] == "0.3"
    assert result["equal"] is False


def test_compare_float_decimal_equal():
    result = compare_float_decimal(0.5, 0.25)
    assert result["equal"] is True


def test_compare_float_decimal_has_all_keys():
    result = compare_float_decimal(0.1, 0.2)
    assert "float_sum" in result
    assert "decimal_sum" in result
    assert "equal" in result


def test_compare_float_decimal_float_sum_type():
    result = compare_float_decimal(0.1, 0.2)
    assert isinstance(result["float_sum"], float)
