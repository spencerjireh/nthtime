import pytest
from solution import Temperature


def test_celsius_getter():
    t = Temperature(100)
    assert t.celsius == 100


def test_celsius_setter():
    t = Temperature(0)
    t.celsius = 50
    assert t.celsius == 50


def test_fahrenheit_getter():
    t = Temperature(100)
    assert t.fahrenheit == pytest.approx(212.0)


def test_fahrenheit_at_zero():
    t = Temperature(0)
    assert t.fahrenheit == pytest.approx(32.0)


def test_fahrenheit_setter():
    t = Temperature(0)
    t.fahrenheit = 32
    assert t.celsius == pytest.approx(0.0)


def test_fahrenheit_setter_boiling():
    t = Temperature(0)
    t.fahrenheit = 212
    assert t.celsius == pytest.approx(100.0)


def test_below_absolute_zero_celsius():
    with pytest.raises(ValueError):
        Temperature(-300)


def test_below_absolute_zero_setter():
    t = Temperature(0)
    with pytest.raises(ValueError):
        t.celsius = -274


def test_fahrenheit_setter_triggers_validation():
    t = Temperature(0)
    with pytest.raises(ValueError):
        t.fahrenheit = -500


def test_at_absolute_zero():
    t = Temperature(-273.15)
    assert t.celsius == pytest.approx(-273.15)
    assert t.fahrenheit == pytest.approx(-459.67)
