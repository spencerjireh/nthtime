from solution import batch_process, until_sentinel, round_robin


def test_batch_process_even():
    result = batch_process([1, 2, 3, 4], 2, sum)
    assert result == [3, 7]


def test_batch_process_uneven():
    result = batch_process([1, 2, 3, 4, 5], 2, sum)
    assert result == [3, 7, 5]


def test_batch_process_single_batch():
    result = batch_process([1, 2, 3], 5, sum)
    assert result == [6]


def test_batch_process_custom_processor():
    result = batch_process([1, 2, 3, 4], 2, lambda b: len(b))
    assert result == [2, 2]


def test_batch_process_empty():
    result = batch_process([], 3, sum)
    assert result == []


def test_until_sentinel_basic():
    result = list(until_sentinel([1, 2, 0, 3], 0))
    assert result == [1, 2]


def test_until_sentinel_at_start():
    result = list(until_sentinel([0, 1, 2], 0))
    assert result == []


def test_until_sentinel_not_found():
    result = list(until_sentinel([1, 2, 3], 0))
    assert result == [1, 2, 3]


def test_until_sentinel_at_end():
    result = list(until_sentinel([1, 2, 3, 0], 0))
    assert result == [1, 2, 3]


def test_round_robin_equal_length():
    result = list(round_robin([1, 2], ["a", "b"]))
    assert result == [1, "a", 2, "b"]


def test_round_robin_unequal_length():
    result = list(round_robin([1, 2], ["a", "b", "c"]))
    assert result == [1, "a", 2, "b", "c"]


def test_round_robin_three_iterables():
    result = list(round_robin([1], [2], [3]))
    assert result == [1, 2, 3]


def test_round_robin_empty():
    result = list(round_robin([], [1, 2]))
    assert result == [1, 2]


def test_round_robin_single():
    result = list(round_robin([1, 2, 3]))
    assert result == [1, 2, 3]
