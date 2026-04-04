from solution import fibonacci, chunks, flatten_gen


def test_fibonacci_first_seven():
    fib = fibonacci()
    result = [next(fib) for _ in range(7)]
    assert result == [0, 1, 1, 2, 3, 5, 8]


def test_fibonacci_first_two():
    fib = fibonacci()
    assert next(fib) == 0
    assert next(fib) == 1


def test_fibonacci_tenth():
    fib = fibonacci()
    for _ in range(9):
        next(fib)
    assert next(fib) == 34


def test_fibonacci_is_generator():
    fib = fibonacci()
    assert hasattr(fib, "__next__")


def test_chunks_even():
    result = list(chunks([1, 2, 3, 4], 2))
    assert result == [[1, 2], [3, 4]]


def test_chunks_uneven():
    result = list(chunks([1, 2, 3, 4, 5], 2))
    assert result == [[1, 2], [3, 4], [5]]


def test_chunks_size_one():
    result = list(chunks([1, 2, 3], 1))
    assert result == [[1], [2], [3]]


def test_chunks_larger_than_list():
    result = list(chunks([1, 2], 5))
    assert result == [[1, 2]]


def test_chunks_empty():
    result = list(chunks([], 3))
    assert result == []


def test_flatten_gen_basic():
    result = list(flatten_gen([[1, 2], [3], [4, 5]]))
    assert result == [1, 2, 3, 4, 5]


def test_flatten_gen_empty_sublists():
    result = list(flatten_gen([[], [1], [], [2, 3], []]))
    assert result == [1, 2, 3]


def test_flatten_gen_single():
    result = list(flatten_gen([[1, 2, 3]]))
    assert result == [1, 2, 3]


def test_flatten_gen_empty():
    result = list(flatten_gen([]))
    assert result == []


def test_flatten_gen_strings():
    result = list(flatten_gen([["a", "b"], ["c"]]))
    assert result == ["a", "b", "c"]
