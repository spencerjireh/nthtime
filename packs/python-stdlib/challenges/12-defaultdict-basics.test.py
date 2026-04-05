from solution import group_by_first_letter, index_items, adjacency_list


def test_group_by_first_letter_basic():
    result = group_by_first_letter(['apple', 'avocado', 'banana', 'cherry'])
    assert result == {'a': ['apple', 'avocado'], 'b': ['banana'], 'c': ['cherry']}


def test_group_by_first_letter_single_group():
    result = group_by_first_letter(['ant', 'ape', 'axe'])
    assert result == {'a': ['ant', 'ape', 'axe']}


def test_group_by_first_letter_empty():
    result = group_by_first_letter([])
    assert result == {}


def test_group_by_first_letter_one_word():
    result = group_by_first_letter(['hello'])
    assert result == {'h': ['hello']}


def test_group_by_first_letter_preserves_order():
    result = group_by_first_letter(['banana', 'blueberry'])
    assert result['b'] == ['banana', 'blueberry']


def test_group_by_first_letter_returns_dict():
    result = group_by_first_letter(['a'])
    assert isinstance(result, dict)


def test_index_items_basic():
    result = index_items([('fruit', 'apple'), ('fruit', 'banana'), ('veggie', 'carrot')])
    assert result == {'fruit': ['apple', 'banana'], 'veggie': ['carrot']}


def test_index_items_single_pair():
    result = index_items([('k', 'v')])
    assert result == {'k': ['v']}


def test_index_items_empty():
    result = index_items([])
    assert result == {}


def test_index_items_many_values_per_key():
    result = index_items([('a', 1), ('a', 2), ('a', 3)])
    assert result == {'a': [1, 2, 3]}


def test_index_items_unique_keys():
    result = index_items([('a', 1), ('b', 2), ('c', 3)])
    assert result == {'a': [1], 'b': [2], 'c': [3]}


def test_adjacency_list_basic():
    result = adjacency_list([('a', 'b'), ('b', 'c')])
    assert result == {'a': ['b'], 'b': ['a', 'c'], 'c': ['b']}


def test_adjacency_list_single_edge():
    result = adjacency_list([('x', 'y')])
    assert result == {'x': ['y'], 'y': ['x']}


def test_adjacency_list_empty():
    result = adjacency_list([])
    assert result == {}


def test_adjacency_list_triangle():
    result = adjacency_list([('a', 'b'), ('b', 'c'), ('c', 'a')])
    assert sorted(result['a']) == ['b', 'c']
    assert sorted(result['b']) == ['a', 'c']
    assert sorted(result['c']) == ['a', 'b']


def test_adjacency_list_both_directions():
    result = adjacency_list([('a', 'b')])
    assert 'b' in result['a']
    assert 'a' in result['b']


def test_adjacency_list_returns_dict():
    result = adjacency_list([('a', 'b')])
    assert isinstance(result, dict)
