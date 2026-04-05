from solution import first_n, take_while_positive, drop_while_small


def test_first_n_basic():
    assert first_n([10, 20, 30, 40, 50], 3) == [10, 20, 30]


def test_first_n_more_than_available():
    assert first_n([1, 2], 5) == [1, 2]


def test_first_n_zero():
    assert first_n([1, 2, 3], 0) == []


def test_first_n_empty():
    assert first_n([], 3) == []


def test_first_n_single():
    assert first_n([42], 1) == [42]


def test_first_n_from_generator():
    gen = (x * x for x in range(10))
    assert first_n(gen, 4) == [0, 1, 4, 9]


def test_take_while_positive_basic():
    assert take_while_positive([3, 1, 4, -1, 5]) == [3, 1, 4]


def test_take_while_positive_all_positive():
    assert take_while_positive([1, 2, 3]) == [1, 2, 3]


def test_take_while_positive_starts_negative():
    assert take_while_positive([-1, 2, 3]) == []


def test_take_while_positive_empty():
    assert take_while_positive([]) == []


def test_take_while_positive_zero_stops():
    assert take_while_positive([5, 3, 0, 7]) == [5, 3]


def test_take_while_positive_single():
    assert take_while_positive([10]) == [10]


def test_drop_while_small_basic():
    assert drop_while_small([1, 2, 5, 3, 8], 4) == [5, 3, 8]


def test_drop_while_small_none_dropped():
    assert drop_while_small([10, 20, 30], 5) == [10, 20, 30]


def test_drop_while_small_all_dropped():
    assert drop_while_small([1, 2, 3], 100) == []


def test_drop_while_small_empty():
    assert drop_while_small([], 5) == []


def test_drop_while_small_keeps_later_small_values():
    assert drop_while_small([1, 2, 10, 1, 2], 5) == [10, 1, 2]


def test_drop_while_small_threshold_zero():
    assert drop_while_small([1, 2, 3], 0) == [1, 2, 3]
