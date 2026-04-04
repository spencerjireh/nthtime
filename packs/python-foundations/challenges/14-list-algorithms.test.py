from solution import flatten, unique_ordered, group_consecutive


def test_flatten_basic():
    assert flatten([[1, 2], [3], [4, 5]]) == [1, 2, 3, 4, 5]


def test_flatten_empty():
    assert flatten([]) == []


def test_flatten_single_sublist():
    assert flatten([[1, 2, 3]]) == [1, 2, 3]


def test_flatten_empty_sublists():
    assert flatten([[], [1], []]) == [1]


def test_unique_ordered_basic():
    assert unique_ordered([3, 1, 2, 1, 3, 2]) == [3, 1, 2]


def test_unique_ordered_all_same():
    assert unique_ordered([5, 5, 5]) == [5]


def test_unique_ordered_empty():
    assert unique_ordered([]) == []


def test_unique_ordered_preserves_order():
    assert unique_ordered([4, 2, 3, 2, 4, 1]) == [4, 2, 3, 1]


def test_unique_ordered_already_unique():
    assert unique_ordered([1, 2, 3]) == [1, 2, 3]


def test_group_consecutive_basic():
    assert group_consecutive([1, 1, 2, 2, 2, 3]) == [[1, 1], [2, 2, 2], [3]]


def test_group_consecutive_single_elements():
    assert group_consecutive([1, 2, 3]) == [[1], [2], [3]]


def test_group_consecutive_empty():
    assert group_consecutive([]) == []


def test_group_consecutive_all_same():
    assert group_consecutive([7, 7, 7]) == [[7, 7, 7]]


def test_group_consecutive_alternating():
    assert group_consecutive([1, 2, 1, 2]) == [[1], [2], [1], [2]]


def test_group_consecutive_repeated_groups():
    assert group_consecutive([1, 1, 2, 2, 2, 3, 1, 1]) == [[1, 1], [2, 2, 2], [3], [1, 1]]
