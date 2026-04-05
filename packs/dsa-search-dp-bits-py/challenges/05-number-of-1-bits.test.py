from solution import hamming_weight


def test_three_bits():
    assert hamming_weight(11) == 3


def test_power_of_two():
    assert hamming_weight(128) == 1


def test_zero():
    assert hamming_weight(0) == 0


def test_all_ones_byte():
    assert hamming_weight(255) == 8


def test_one():
    assert hamming_weight(1) == 1


def test_large_number():
    assert hamming_weight(4294967295) == 32
