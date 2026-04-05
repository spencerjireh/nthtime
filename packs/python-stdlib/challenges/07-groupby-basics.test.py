from solution import group_by_length, consecutive_runs, group_by_key


def test_group_by_length_basic():
    result = group_by_length(['a', 'be', 'an', 'cat', 'dog'])
    assert result == {1: ['a'], 2: ['be', 'an'], 3: ['cat', 'dog']}


def test_group_by_length_single_group():
    result = group_by_length(['hi', 'no'])
    assert result == {2: ['hi', 'no']}


def test_group_by_length_empty():
    result = group_by_length([])
    assert result == {}


def test_group_by_length_one_word():
    result = group_by_length(['hello'])
    assert result == {5: ['hello']}


def test_consecutive_runs_basic():
    result = consecutive_runs([1, 1, 2, 2, 2, 3])
    assert result == [(1, 2), (2, 3), (3, 1)]


def test_consecutive_runs_no_repeats():
    result = consecutive_runs([1, 2, 3])
    assert result == [(1, 1), (2, 1), (3, 1)]


def test_consecutive_runs_all_same():
    result = consecutive_runs([5, 5, 5, 5])
    assert result == [(5, 4)]


def test_consecutive_runs_empty():
    result = consecutive_runs([])
    assert result == []


def test_consecutive_runs_single():
    result = consecutive_runs([7])
    assert result == [(7, 1)]


def test_consecutive_runs_strings():
    result = consecutive_runs(['a', 'a', 'b', 'b', 'b'])
    assert result == [('a', 2), ('b', 3)]


def test_group_by_key_even_odd():
    result = group_by_key([2, 4, 1, 3], lambda x: x % 2)
    assert result == {0: [2, 4], 1: [1, 3]}


def test_group_by_key_first_letter():
    words = ['apple', 'avocado', 'banana', 'blueberry']
    result = group_by_key(words, lambda w: w[0])
    assert result == {'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry']}


def test_group_by_key_empty():
    result = group_by_key([], lambda x: x)
    assert result == {}


def test_group_by_key_single_item():
    result = group_by_key([42], lambda x: x)
    assert result == {42: [42]}
