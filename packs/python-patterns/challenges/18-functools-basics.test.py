from solution import multiply, product, double, fibonacci


def test_product_basic():
    assert product([2, 3, 4]) == 24


def test_product_empty():
    assert product([]) == 1


def test_product_single():
    assert product([7]) == 7


def test_product_with_zero():
    assert product([1, 2, 0, 4]) == 0


def test_double_basic():
    assert double(5) == 10


def test_double_zero():
    assert double(0) == 0


def test_double_negative():
    assert double(-3) == -6


def test_fibonacci_zero():
    assert fibonacci(0) == 0


def test_fibonacci_one():
    assert fibonacci(1) == 1


def test_fibonacci_two():
    assert fibonacci(2) == 1


def test_fibonacci_five():
    assert fibonacci(5) == 5


def test_fibonacci_ten():
    assert fibonacci(10) == 55


def test_fibonacci_twenty():
    assert fibonacci(20) == 6765
