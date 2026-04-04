from solution import set_bit, clear_bit, toggle_bit, check_bit


def test_set_bit_from_zero():
    assert set_bit(0, 0) == 1
    assert set_bit(0, 3) == 8


def test_set_bit_already_set():
    assert set_bit(5, 0) == 5


def test_set_bit_position_7():
    assert set_bit(0, 7) == 128


def test_clear_bit_basic():
    assert clear_bit(15, 1) == 13
    assert clear_bit(15, 0) == 14


def test_clear_bit_already_clear():
    assert clear_bit(8, 0) == 8


def test_clear_bit_position_7():
    assert clear_bit(255, 7) == 127


def test_toggle_bit_set_to_clear():
    assert toggle_bit(5, 0) == 4


def test_toggle_bit_clear_to_set():
    assert toggle_bit(5, 1) == 7


def test_toggle_bit_double():
    assert toggle_bit(toggle_bit(42, 3), 3) == 42


def test_check_bit_true():
    assert check_bit(5, 2) is True
    assert check_bit(5, 0) is True


def test_check_bit_false():
    assert check_bit(5, 1) is False
    assert check_bit(0, 0) is False


def test_check_bit_position_0_and_7():
    assert check_bit(128, 7) is True
    assert check_bit(128, 0) is False
