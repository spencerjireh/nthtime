from solution import SortedList


def test_add_maintains_order():
    sl = SortedList()
    sl.add(3)
    sl.add(1)
    sl.add(2)
    assert list(sl) == [1, 2, 3]


def test_len():
    sl = SortedList()
    assert len(sl) == 0
    sl.add(5)
    sl.add(2)
    assert len(sl) == 2


def test_indexing():
    sl = SortedList()
    sl.add(30)
    sl.add(10)
    sl.add(20)
    assert sl[0] == 10
    assert sl[1] == 20
    assert sl[2] == 30
    assert sl[-1] == 30


def test_slicing():
    sl = SortedList()
    for x in [5, 3, 1, 4, 2]:
        sl.add(x)
    assert sl[0:3] == [1, 2, 3]
    assert sl[2:] == [3, 4, 5]


def test_contains_true():
    sl = SortedList()
    sl.add(10)
    sl.add(20)
    sl.add(30)
    assert 20 in sl


def test_contains_false():
    sl = SortedList()
    sl.add(10)
    sl.add(30)
    assert 20 not in sl


def test_iteration():
    sl = SortedList()
    sl.add(3)
    sl.add(1)
    sl.add(2)
    result = []
    for item in sl:
        result.append(item)
    assert result == [1, 2, 3]


def test_repr():
    sl = SortedList()
    sl.add(3)
    sl.add(1)
    sl.add(2)
    assert repr(sl) == "SortedList([1, 2, 3])"


def test_repr_empty():
    sl = SortedList()
    assert repr(sl) == "SortedList([])"


def test_duplicates():
    sl = SortedList()
    sl.add(2)
    sl.add(2)
    sl.add(1)
    assert list(sl) == [1, 2, 2]
    assert len(sl) == 3
