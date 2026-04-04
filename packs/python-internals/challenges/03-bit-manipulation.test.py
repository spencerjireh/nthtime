from solution import count_ones, is_power_of_two, next_power_of_two, swap_nibbles


def test_count_ones_zero():
    assert count_ones(0) == 0


def test_count_ones_one():
    assert count_ones(1) == 1


def test_count_ones_seven():
    assert count_ones(7) == 3


def test_count_ones_255():
    assert count_ones(255) == 8


def test_count_ones_negative():
    assert count_ones(-1) == 32


def test_is_power_of_two_true():
    assert is_power_of_two(1) is True
    assert is_power_of_two(2) is True
    assert is_power_of_two(4) is True
    assert is_power_of_two(1024) is True


def test_is_power_of_two_false():
    assert is_power_of_two(3) is False
    assert is_power_of_two(6) is False
    assert is_power_of_two(15) is False


def test_is_power_of_two_zero():
    assert is_power_of_two(0) is False


def test_next_power_of_two_exact():
    assert next_power_of_two(4) == 4
    assert next_power_of_two(16) == 16


def test_next_power_of_two_non_exact():
    assert next_power_of_two(3) == 4
    assert next_power_of_two(5) == 8


def test_next_power_of_two_one():
    assert next_power_of_two(1) == 1


def test_next_power_of_two_zero():
    assert next_power_of_two(0) == 1


def test_swap_nibbles_ab():
    assert swap_nibbles(0xAB) == 0xBA


def test_swap_nibbles_12():
    assert swap_nibbles(0x12) == 0x21


def test_swap_nibbles_zero():
    assert swap_nibbles(0x00) == 0x00


def test_swap_nibbles_ff():
    assert swap_nibbles(0xFF) == 0xFF
