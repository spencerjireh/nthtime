from solution import head_tail, swap_pairs, merge_sorted


def test_head_tail_basic():
    first, rest = head_tail([1, 2, 3, 4])
    assert first == 1
    assert rest == [2, 3, 4]


def test_head_tail_two_elements():
    first, rest = head_tail([10, 20])
    assert first == 10
    assert rest == [20]


def test_head_tail_single():
    first, rest = head_tail([42])
    assert first == 42
    assert rest == []


def test_swap_pairs_basic():
    assert swap_pairs([(1, 2), (3, 4)]) == [(2, 1), (4, 3)]


def test_swap_pairs_strings():
    assert swap_pairs([("a", "b"), ("c", "d")]) == [("b", "a"), ("d", "c")]


def test_swap_pairs_empty():
    assert swap_pairs([]) == []


def test_merge_sorted_two():
    assert merge_sorted([1, 3, 5], [2, 4, 6]) == [1, 2, 3, 4, 5, 6]


def test_merge_sorted_three():
    assert merge_sorted([1, 4], [2, 5], [3, 6]) == [1, 2, 3, 4, 5, 6]


def test_merge_sorted_empty():
    assert merge_sorted([], [1, 2]) == [1, 2]


def test_merge_sorted_single():
    assert merge_sorted([3, 1, 2]) == [1, 2, 3]
