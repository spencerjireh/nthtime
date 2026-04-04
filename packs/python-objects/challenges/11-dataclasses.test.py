import pytest
from solution import Point, Employee, distance


def test_point_creation():
    p = Point(3.0, 4.0)
    assert p.x == 3.0
    assert p.y == 4.0


def test_point_equality():
    assert Point(1, 2) == Point(1, 2)


def test_point_inequality():
    assert Point(1, 2) != Point(3, 4)


def test_point_repr():
    p = Point(1, 2)
    assert repr(p) == "Point(x=1, y=2)"


def test_employee_creation():
    e = Employee("Alice", "Eng", 90000)
    assert e.name == "Alice"
    assert e.department == "Eng"
    assert e.salary == 90000


def test_employee_negative_salary():
    with pytest.raises(ValueError):
        Employee("Bob", "Eng", -1)


def test_employee_zero_salary():
    e = Employee("Charlie", "Eng", 0)
    assert e.salary == 0


def test_distance_3_4_5():
    p1 = Point(0, 0)
    p2 = Point(3, 4)
    assert distance(p1, p2) == pytest.approx(5.0)


def test_distance_same_point():
    p = Point(1, 1)
    assert distance(p, p) == pytest.approx(0.0)


def test_distance_negative_coords():
    p1 = Point(-1, -1)
    p2 = Point(2, 3)
    assert distance(p1, p2) == pytest.approx(5.0)
