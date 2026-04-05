from solution import max_profit


def test_basic():
    assert max_profit([7, 1, 5, 3, 6, 4]) == 5


def test_no_profit():
    assert max_profit([7, 6, 4, 3, 1]) == 0


def test_two_elements():
    assert max_profit([1, 2]) == 1


def test_dip_then_rise():
    assert max_profit([2, 4, 1]) == 2


def test_single():
    assert max_profit([5]) == 0


def test_empty():
    assert max_profit([]) == 0


def test_large_profit():
    assert max_profit([1, 100]) == 99
