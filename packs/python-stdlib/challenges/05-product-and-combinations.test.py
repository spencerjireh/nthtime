from solution import coordinate_grid, choose_pairs, all_subsets


def test_coordinate_grid_basic():
    result = coordinate_grid(2, 3)
    assert result == [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2)]


def test_coordinate_grid_square():
    result = coordinate_grid(2, 2)
    assert result == [(0, 0), (0, 1), (1, 0), (1, 1)]


def test_coordinate_grid_single_row():
    result = coordinate_grid(1, 3)
    assert result == [(0, 0), (0, 1), (0, 2)]


def test_coordinate_grid_single_cell():
    result = coordinate_grid(1, 1)
    assert result == [(0, 0)]


def test_coordinate_grid_zero_rows():
    assert coordinate_grid(0, 3) == []


def test_coordinate_grid_zero_cols():
    assert coordinate_grid(3, 0) == []


def test_coordinate_grid_count():
    result = coordinate_grid(3, 4)
    assert len(result) == 12


def test_choose_pairs_basic():
    assert choose_pairs(["a", "b", "c"]) == [("a", "b"), ("a", "c"), ("b", "c")]


def test_choose_pairs_numbers():
    assert choose_pairs([1, 2, 3, 4]) == [
        (1, 2), (1, 3), (1, 4),
        (2, 3), (2, 4),
        (3, 4),
    ]


def test_choose_pairs_two_items():
    assert choose_pairs([10, 20]) == [(10, 20)]


def test_choose_pairs_single_item():
    assert choose_pairs([1]) == []


def test_choose_pairs_empty():
    assert choose_pairs([]) == []


def test_choose_pairs_count():
    result = choose_pairs(list(range(5)))
    assert len(result) == 10


def test_all_subsets_size_two():
    assert all_subsets([1, 2, 3], 2) == [(1, 2), (1, 3), (2, 3)]


def test_all_subsets_size_one():
    assert all_subsets([1, 2, 3], 1) == [(1,), (2,), (3,)]


def test_all_subsets_size_three():
    assert all_subsets([1, 2, 3], 3) == [(1, 2, 3)]


def test_all_subsets_size_zero():
    assert all_subsets([1, 2, 3], 0) == [()]


def test_all_subsets_size_exceeds():
    assert all_subsets([1, 2], 3) == []


def test_all_subsets_empty():
    assert all_subsets([], 0) == [()]


def test_all_subsets_strings():
    result = all_subsets(["a", "b", "c", "d"], 2)
    assert len(result) == 6
    assert ("a", "b") in result
    assert ("c", "d") in result
