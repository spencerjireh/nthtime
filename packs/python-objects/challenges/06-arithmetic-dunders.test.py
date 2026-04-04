from solution import Vector


def test_add():
    assert Vector(1, 2) + Vector(3, 4) == Vector(4, 6)


def test_sub():
    assert Vector(5, 7) - Vector(2, 3) == Vector(3, 4)


def test_mul():
    assert Vector(2, 3) * 3 == Vector(6, 9)


def test_mul_zero():
    assert Vector(5, 10) * 0 == Vector(0, 0)


def test_neg():
    assert -Vector(3, -4) == Vector(-3, 4)


def test_abs_345():
    assert abs(Vector(3, 4)) == 5.0


def test_abs_zero():
    assert abs(Vector(0, 0)) == 0.0


def test_eq():
    assert Vector(1, 2) == Vector(1, 2)


def test_not_eq():
    assert Vector(1, 2) != Vector(1, 3)


def test_repr():
    assert repr(Vector(3, 4)) == "Vector(3, 4)"


def test_zero_vector():
    zero = Vector(0, 0)
    v = Vector(5, 10)
    assert v + zero == v
    assert v - zero == v
