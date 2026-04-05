from solution import apply_pairs, parallel_max, interleave_longest


def test_apply_pairs_addition():
    assert apply_pairs([(1, 2), (3, 4)], lambda a, b: a + b) == [3, 7]


def test_apply_pairs_multiplication():
    assert apply_pairs([(2, 3), (4, 5)], lambda a, b: a * b) == [6, 20]


def test_apply_pairs_empty():
    assert apply_pairs([], lambda a, b: a + b) == []


def test_apply_pairs_single_pair():
    assert apply_pairs([(10, 20)], lambda a, b: a - b) == [-10]


def test_apply_pairs_power():
    assert apply_pairs([(2, 3), (3, 2)], pow) == [8, 9]


def test_parallel_max_basic():
    assert parallel_max([[1, 5, 3], [2, 4, 6]]) == [2, 5, 6]


def test_parallel_max_single_list():
    assert parallel_max([[1, 2, 3]]) == [1, 2, 3]


def test_parallel_max_uneven_lengths():
    result = parallel_max([[1, 2, 3], [10, 20]])
    assert result == [10, 20, 3]


def test_parallel_max_three_lists():
    assert parallel_max([[1, 2], [3, 4], [5, 6]]) == [5, 6]


def test_parallel_max_negative_values():
    assert parallel_max([[-1, -2], [-3, -4]]) == [-1, -2]


def test_interleave_longest_equal():
    assert interleave_longest([1, 2, 3], ['a', 'b', 'c']) == [1, 'a', 2, 'b', 3, 'c']


def test_interleave_longest_first_longer():
    assert interleave_longest([1, 2, 3], ['a', 'b']) == [1, 'a', 2, 'b', 3]


def test_interleave_longest_second_longer():
    assert interleave_longest([1], ['a', 'b', 'c']) == [1, 'a', 'b', 'c']


def test_interleave_longest_empty_first():
    assert interleave_longest([], ['a', 'b']) == ['a', 'b']


def test_interleave_longest_both_empty():
    assert interleave_longest([], []) == []


def test_interleave_longest_single_elements():
    assert interleave_longest([1], ['a']) == [1, 'a']
