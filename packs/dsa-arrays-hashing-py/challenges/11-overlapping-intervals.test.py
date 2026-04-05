from solution import can_attend_all


def test_overlap():
    assert can_attend_all([[0, 30], [5, 10], [15, 20]]) is False


def test_no_overlap():
    assert can_attend_all([[7, 10], [2, 4]]) is True


def test_empty():
    assert can_attend_all([]) is True


def test_touching():
    assert can_attend_all([[1, 5], [5, 10]]) is True


def test_single():
    assert can_attend_all([[1, 100]]) is True


def test_nested():
    assert can_attend_all([[1, 10], [2, 5]]) is False


def test_sorted_no_overlap():
    assert can_attend_all([[1, 2], [3, 4], [5, 6], [7, 8]]) is True
