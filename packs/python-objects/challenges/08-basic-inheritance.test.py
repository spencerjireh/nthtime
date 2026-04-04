import math
import pytest
from solution import Shape, Circle, Rectangle


def test_shape_area_raises():
    s = Shape()
    with pytest.raises(NotImplementedError):
        s.area()


def test_shape_repr():
    assert repr(Shape()) == "Shape()"


def test_circle_area():
    c = Circle(5)
    assert c.area() == pytest.approx(math.pi * 25)


def test_circle_area_unit():
    c = Circle(1)
    assert c.area() == pytest.approx(math.pi)


def test_circle_repr():
    assert repr(Circle(5)) == "Circle(5)"


def test_rectangle_area():
    r = Rectangle(3, 4)
    assert r.area() == 12


def test_rectangle_area_square():
    r = Rectangle(5, 5)
    assert r.area() == 25


def test_rectangle_repr():
    assert repr(Rectangle(3, 4)) == "Rectangle(3, 4)"


def test_circle_isinstance():
    c = Circle(1)
    assert isinstance(c, Shape)
    assert isinstance(c, Circle)


def test_rectangle_isinstance():
    r = Rectangle(1, 1)
    assert isinstance(r, Shape)
    assert isinstance(r, Rectangle)
