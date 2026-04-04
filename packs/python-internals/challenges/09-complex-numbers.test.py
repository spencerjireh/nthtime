import cmath
from solution import magnitude, rotate, roots_of_unity, mandelbrot_escape


def test_magnitude_integer_result():
    assert magnitude(3 + 4j) == 5.0


def test_magnitude_zero():
    assert magnitude(0 + 0j) == 0.0


def test_magnitude_pure_imaginary():
    assert magnitude(5j) == 5.0


def test_magnitude_real_negative():
    assert magnitude(-3 + 0j) == 3.0


def test_rotate_90_degrees():
    result = rotate(1 + 0j, 90)
    assert abs(result.real - 0) < 1e-10
    assert abs(result.imag - 1) < 1e-10


def test_rotate_180_degrees():
    result = rotate(1 + 0j, 180)
    assert abs(result.real - (-1)) < 1e-10
    assert abs(result.imag - 0) < 1e-10


def test_rotate_360_degrees():
    result = rotate(1 + 0j, 360)
    assert abs(result.real - 1) < 1e-10
    assert abs(result.imag - 0) < 1e-10


def test_roots_of_unity_count():
    roots = roots_of_unity(4)
    assert len(roots) == 4


def test_roots_of_unity_sum_is_zero():
    roots = roots_of_unity(4)
    total = sum(roots)
    assert abs(total) < 1e-10


def test_roots_of_unity_first_is_one():
    roots = roots_of_unity(5)
    assert abs(roots[0] - 1) < 1e-10


def test_roots_of_unity_on_unit_circle():
    roots = roots_of_unity(6)
    for r in roots:
        assert abs(abs(r) - 1) < 1e-10


def test_mandelbrot_escape_origin_stays():
    assert mandelbrot_escape(0) == 100


def test_mandelbrot_escape_large_value():
    assert mandelbrot_escape(2) == 1


def test_mandelbrot_escape_custom_max_iter():
    assert mandelbrot_escape(0, max_iter=50) == 50


def test_mandelbrot_escape_minus_one():
    result = mandelbrot_escape(-1)
    assert result == 100
