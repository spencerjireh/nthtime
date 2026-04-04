from solution import power, build_profile


def test_power_default_exponent():
    assert power(3) == 9
    assert power(5) == 25


def test_power_custom_exponent():
    assert power(2, 10) == 1024
    assert power(3, 3) == 27


def test_power_zero():
    assert power(0) == 0
    assert power(5, 0) == 1
    assert power(0, 0) == 1


def test_build_profile_no_kwargs():
    result = build_profile("Alice")
    assert result == {"name": "Alice"}


def test_build_profile_with_kwargs():
    result = build_profile("Alice", age=30)
    assert result == {"name": "Alice", "age": 30}


def test_build_profile_multiple_kwargs():
    result = build_profile("Bob", age=25, role="dev", city="NYC")
    assert result == {"name": "Bob", "age": 25, "role": "dev", "city": "NYC"}
