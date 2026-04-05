from solution import count_bits


def test_two():
    assert count_bits(2) == [0, 1, 1]


def test_five():
    assert count_bits(5) == [0, 1, 1, 2, 1, 2]


def test_zero():
    assert count_bits(0) == [0]


def test_one():
    assert count_bits(1) == [0, 1]


def test_eight():
    assert count_bits(8) == [0, 1, 1, 2, 1, 2, 2, 3, 1]


def test_fifteen():
    assert count_bits(15) == [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4]
