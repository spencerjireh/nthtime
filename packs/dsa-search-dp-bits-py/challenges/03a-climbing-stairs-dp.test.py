from solution import climb_stairs


def test_two_steps():
    assert climb_stairs(2) == 2


def test_three_steps():
    assert climb_stairs(3) == 3


def test_one_step():
    assert climb_stairs(1) == 1


def test_five_steps():
    assert climb_stairs(5) == 8


def test_ten_steps():
    assert climb_stairs(10) == 89


def test_twenty_steps():
    assert climb_stairs(20) == 10946
