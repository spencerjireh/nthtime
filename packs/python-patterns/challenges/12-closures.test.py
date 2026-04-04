from solution import make_counter, make_accumulator, make_multiplier


def test_counter_default_start():
    c = make_counter()
    assert c() == 0
    assert c() == 1
    assert c() == 2


def test_counter_custom_start():
    c = make_counter(5)
    assert c() == 5
    assert c() == 6
    assert c() == 7


def test_counter_negative_start():
    c = make_counter(-2)
    assert c() == -2
    assert c() == -1
    assert c() == 0


def test_counter_independent():
    c1 = make_counter(0)
    c2 = make_counter(100)
    assert c1() == 0
    assert c2() == 100
    assert c1() == 1
    assert c2() == 101


def test_accumulator_basic():
    acc = make_accumulator()
    assert acc(10) == 10
    assert acc(5) == 15
    assert acc(3) == 18


def test_accumulator_negative():
    acc = make_accumulator()
    assert acc(10) == 10
    assert acc(-3) == 7


def test_accumulator_independent():
    a1 = make_accumulator()
    a2 = make_accumulator()
    a1(10)
    a2(100)
    assert a1(5) == 15
    assert a2(50) == 150


def test_multiplier_double():
    double = make_multiplier(2)
    assert double(5) == 10
    assert double(3) == 6


def test_multiplier_triple():
    triple = make_multiplier(3)
    assert triple(4) == 12


def test_multiplier_zero():
    zero = make_multiplier(0)
    assert zero(100) == 0


def test_multiplier_negative():
    neg = make_multiplier(-1)
    assert neg(5) == -5
    assert neg(-3) == 3
