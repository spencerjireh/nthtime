from solution import invert_index, sparse_to_dense, group_anagrams


def test_invert_index_basic():
    docs = {"d1": ["a", "b"], "d2": ["b", "c"]}
    result = invert_index(docs)
    assert result == {"a": ["d1"], "b": ["d1", "d2"], "c": ["d2"]}


def test_invert_index_single_doc():
    docs = {"doc": ["x", "y", "z"]}
    result = invert_index(docs)
    assert result == {"x": ["doc"], "y": ["doc"], "z": ["doc"]}


def test_invert_index_empty():
    assert invert_index({}) == {}


def test_invert_index_shared_words():
    docs = {"a": ["hello"], "b": ["hello"], "c": ["hello"]}
    result = invert_index(docs)
    assert result == {"hello": ["a", "b", "c"]}


def test_sparse_to_dense_basic():
    sparse = {(0, 1): 5, (1, 0): 3}
    result = sparse_to_dense(sparse, 2, 2)
    assert result == [[0, 5], [3, 0]]


def test_sparse_to_dense_empty():
    result = sparse_to_dense({}, 2, 3)
    assert result == [[0, 0, 0], [0, 0, 0]]


def test_sparse_to_dense_custom_default():
    result = sparse_to_dense({(0, 0): 1}, 2, 2, default=-1)
    assert result == [[1, -1], [-1, -1]]


def test_sparse_to_dense_full():
    sparse = {(0, 0): 1, (0, 1): 2, (1, 0): 3, (1, 1): 4}
    result = sparse_to_dense(sparse, 2, 2)
    assert result == [[1, 2], [3, 4]]


def test_group_anagrams_basic():
    result = group_anagrams(["cat", "tac", "dog", "god"])
    assert len(result) == 2
    for group in result:
        group.sort()
    result.sort()
    assert result == [["cat", "tac"], ["dog", "god"]]


def test_group_anagrams_no_anagrams():
    result = group_anagrams(["abc", "def", "ghi"])
    assert len(result) == 3
    for group in result:
        assert len(group) == 1


def test_group_anagrams_all_anagrams():
    result = group_anagrams(["abc", "bca", "cab"])
    assert len(result) == 1
    assert sorted(result[0]) == ["abc", "bca", "cab"]


def test_group_anagrams_empty():
    assert group_anagrams([]) == []
