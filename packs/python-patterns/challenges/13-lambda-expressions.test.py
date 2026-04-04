from solution import sort_by_last, apply_operations, make_adder


def test_sort_by_last_basic():
    result = sort_by_last(["hello", "world", "abc"])
    assert result == ["abc", "world", "hello"]


def test_sort_by_last_same_last():
    result = sort_by_last(["ba", "ca", "aa"])
    assert all(s[-1] == "a" for s in result)


def test_sort_by_last_single():
    assert sort_by_last(["only"]) == ["only"]


def test_sort_by_last_empty():
    assert sort_by_last([]) == []


def test_sort_by_last_numbers_as_strings():
    result = sort_by_last(["a1", "b3", "c2"])
    assert result == ["a1", "c2", "b3"]


def test_apply_operations_basic():
    ops = [lambda x: x + 1, lambda x: x * 2]
    assert apply_operations(3, ops) == 8


def test_apply_operations_single():
    ops = [lambda x: x * 10]
    assert apply_operations(5, ops) == 50


def test_apply_operations_empty():
    assert apply_operations(42, []) == 42


def test_apply_operations_three_ops():
    ops = [lambda x: x + 1, lambda x: x + 1, lambda x: x + 1]
    assert apply_operations(0, ops) == 3


def test_make_adder_basic():
    add5 = make_adder(5)
    assert add5(3) == 8
    assert add5(0) == 5


def test_make_adder_zero():
    add0 = make_adder(0)
    assert add0(10) == 10


def test_make_adder_negative():
    sub3 = make_adder(-3)
    assert sub3(10) == 7


def test_make_adder_independent():
    add1 = make_adder(1)
    add100 = make_adder(100)
    assert add1(5) == 6
    assert add100(5) == 105
