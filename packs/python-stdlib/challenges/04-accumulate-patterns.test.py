from solution import running_total, running_max, factorial_sequence


def test_running_total_basic():
    assert running_total([1, 2, 3, 4]) == [1, 3, 6, 10]


def test_running_total_single():
    assert running_total([5]) == [5]


def test_running_total_empty():
    assert running_total([]) == []


def test_running_total_with_negatives():
    assert running_total([1, -1, 2, -2]) == [1, 0, 2, 0]


def test_running_total_all_same():
    assert running_total([3, 3, 3]) == [3, 6, 9]


def test_running_total_zeros():
    assert running_total([0, 0, 0]) == [0, 0, 0]


def test_running_max_basic():
    assert running_max([3, 1, 4, 1, 5]) == [3, 3, 4, 4, 5]


def test_running_max_ascending():
    assert running_max([1, 2, 3, 4]) == [1, 2, 3, 4]


def test_running_max_descending():
    assert running_max([4, 3, 2, 1]) == [4, 4, 4, 4]


def test_running_max_single():
    assert running_max([7]) == [7]


def test_running_max_empty():
    assert running_max([]) == []


def test_running_max_with_negatives():
    assert running_max([-3, -1, -4, -1]) == [-3, -1, -1, -1]


def test_running_max_all_same():
    assert running_max([5, 5, 5]) == [5, 5, 5]


def test_factorial_sequence_basic():
    assert factorial_sequence(5) == [1, 2, 6, 24, 120]


def test_factorial_sequence_one():
    assert factorial_sequence(1) == [1]


def test_factorial_sequence_two():
    assert factorial_sequence(2) == [1, 2]


def test_factorial_sequence_six():
    assert factorial_sequence(6) == [1, 2, 6, 24, 120, 720]


def test_factorial_sequence_ten():
    result = factorial_sequence(10)
    assert result[0] == 1
    assert result[9] == 3628800
    assert len(result) == 10
