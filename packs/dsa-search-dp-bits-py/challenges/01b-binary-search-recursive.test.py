from solution import search


def test_found_in_middle():
    assert search([-1, 0, 3, 5, 9, 12], 9) == 4


def test_not_found():
    assert search([-1, 0, 3, 5, 9, 12], 2) == -1


def test_single_element_found():
    assert search([5], 5) == 0


def test_empty_list():
    assert search([], 3) == -1


def test_first_element():
    assert search([1, 3, 5, 7, 9], 1) == 0


def test_last_element():
    assert search([1, 3, 5, 7, 9], 9) == 4


def test_single_element_not_found():
    assert search([5], 3) == -1
