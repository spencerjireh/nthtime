from solution import unique_words, common_elements, symmetric_diff


def test_unique_words_basic():
    assert unique_words("hello world") == {"hello", "world"}


def test_unique_words_duplicates():
    assert unique_words("hello hello hello") == {"hello"}


def test_unique_words_mixed_case():
    assert unique_words("Hello HELLO hello") == {"hello"}


def test_unique_words_empty():
    assert unique_words("") == set()


def test_unique_words_multiple():
    result = unique_words("The the THE cat Cat")
    assert result == {"the", "cat"}


def test_common_elements_overlap():
    assert common_elements([1, 2, 3], [2, 3, 4]) == [2, 3]


def test_common_elements_none():
    assert common_elements([1, 2], [3, 4]) == []


def test_common_elements_identical():
    assert common_elements([1, 2, 3], [1, 2, 3]) == [1, 2, 3]


def test_common_elements_empty():
    assert common_elements([], [1, 2]) == []


def test_common_elements_strings():
    assert common_elements(["a", "b", "c"], ["b", "c", "d"]) == ["b", "c"]


def test_symmetric_diff_basic():
    assert symmetric_diff([1, 2, 3], [2, 3, 4]) == [1, 4]


def test_symmetric_diff_identical():
    assert symmetric_diff([1, 2, 3], [1, 2, 3]) == []


def test_symmetric_diff_disjoint():
    assert symmetric_diff([1, 2], [3, 4]) == [1, 2, 3, 4]


def test_symmetric_diff_empty():
    assert symmetric_diff([], [1, 2]) == [1, 2]
