from solution import my_map, my_filter, compose, pipe


def test_my_map_basic():
    assert my_map(str.upper, ["a", "b", "c"]) == ["A", "B", "C"]


def test_my_map_squares():
    assert my_map(lambda x: x * x, [1, 2, 3]) == [1, 4, 9]


def test_my_map_empty():
    assert my_map(str.upper, []) == []


def test_my_map_identity():
    assert my_map(lambda x: x, [1, 2, 3]) == [1, 2, 3]


def test_my_filter_basic():
    assert my_filter(lambda x: x > 0, [-1, 2, -3, 4]) == [2, 4]


def test_my_filter_all_pass():
    assert my_filter(lambda x: True, [1, 2, 3]) == [1, 2, 3]


def test_my_filter_none_pass():
    assert my_filter(lambda x: False, [1, 2, 3]) == []


def test_my_filter_empty():
    assert my_filter(lambda x: x > 0, []) == []


def test_my_filter_strings():
    assert my_filter(lambda s: len(s) > 3, ["hi", "hello", "yo", "world"]) == ["hello", "world"]


def test_compose_two():
    add1 = lambda x: x + 1
    double = lambda x: x * 2
    assert compose(add1, double)(3) == 7  # add1(double(3)) = add1(6) = 7


def test_compose_three():
    add1 = lambda x: x + 1
    double = lambda x: x * 2
    negate = lambda x: -x
    assert compose(negate, add1, double)(3) == -7  # negate(add1(double(3)))


def test_compose_single():
    double = lambda x: x * 2
    assert compose(double)(5) == 10


def test_compose_identity():
    identity = lambda x: x
    assert compose(identity, identity)(42) == 42


def test_pipe_two():
    add1 = lambda x: x + 1
    double = lambda x: x * 2
    assert pipe(add1, double)(3) == 8  # double(add1(3)) = double(4) = 8


def test_pipe_three():
    add1 = lambda x: x + 1
    double = lambda x: x * 2
    negate = lambda x: -x
    assert pipe(double, add1, negate)(3) == -7  # negate(add1(double(3)))


def test_pipe_single():
    double = lambda x: x * 2
    assert pipe(double)(5) == 10


def test_pipe_vs_compose():
    add1 = lambda x: x + 1
    double = lambda x: x * 2
    # pipe(f, g)(x) == compose(g, f)(x)
    assert pipe(add1, double)(10) == compose(double, add1)(10)
