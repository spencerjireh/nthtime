from solution import batched, unique_justseen, roundrobin


def test_batched_even():
    assert list(batched([1, 2, 3, 4], 2)) == [(1, 2), (3, 4)]


def test_batched_uneven():
    assert list(batched([1, 2, 3, 4, 5], 2)) == [(1, 2), (3, 4), (5,)]


def test_batched_single_chunk():
    assert list(batched([1, 2, 3], 5)) == [(1, 2, 3)]


def test_batched_size_one():
    assert list(batched([1, 2, 3], 1)) == [(1,), (2,), (3,)]


def test_batched_empty():
    assert list(batched([], 3)) == []


def test_batched_returns_tuples():
    result = list(batched([1, 2, 3, 4], 2))
    assert all(isinstance(chunk, tuple) for chunk in result)


def test_unique_justseen_basic():
    assert list(unique_justseen([1, 1, 2, 3, 3])) == [1, 2, 3]


def test_unique_justseen_no_duplicates():
    assert list(unique_justseen([1, 2, 3])) == [1, 2, 3]


def test_unique_justseen_all_same():
    assert list(unique_justseen([5, 5, 5, 5])) == [5]


def test_unique_justseen_non_consecutive_repeats():
    assert list(unique_justseen([1, 2, 1, 2])) == [1, 2, 1, 2]


def test_unique_justseen_empty():
    assert list(unique_justseen([])) == []


def test_unique_justseen_single():
    assert list(unique_justseen([42])) == [42]


def test_unique_justseen_strings():
    assert list(unique_justseen('AABBBCC')) == ['A', 'B', 'C']


def test_roundrobin_basic():
    assert list(roundrobin('ABC', 'D', 'EF')) == ['A', 'D', 'E', 'B', 'F', 'C']


def test_roundrobin_equal_length():
    assert list(roundrobin([1, 2], [3, 4])) == [1, 3, 2, 4]


def test_roundrobin_single_iterable():
    assert list(roundrobin([1, 2, 3])) == [1, 2, 3]


def test_roundrobin_empty():
    assert list(roundrobin()) == []


def test_roundrobin_with_empty_iterable():
    assert list(roundrobin([1, 2], [], [3])) == [1, 3, 2]
