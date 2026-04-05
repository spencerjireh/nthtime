from solution import reverse_bits


def test_example_one():
    assert reverse_bits(43261596) == 964176192


def test_example_two():
    assert reverse_bits(4294967293) == 3221225471


def test_zero():
    assert reverse_bits(0) == 0


def test_one():
    assert reverse_bits(1) == 2147483648


def test_max_uint32():
    assert reverse_bits(4294967295) == 4294967295


def test_power_of_two():
    assert reverse_bits(2) == 1073741824
