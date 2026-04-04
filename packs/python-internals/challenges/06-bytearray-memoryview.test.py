from solution import patch_bytes, view_slice, find_pattern


def test_patch_bytes_beginning():
    assert patch_bytes(b"hello", 0, b"j") == b"jello"


def test_patch_bytes_middle():
    assert patch_bytes(b"hello", 1, b"a") == b"hallo"


def test_patch_bytes_end():
    assert patch_bytes(b"hello", 4, b"p") == b"hellp"


def test_patch_bytes_multi():
    assert patch_bytes(b"hello", 1, b"ou") == b"houlo"


def test_view_slice_basic():
    assert view_slice(b"abcdef", 2, 5) == b"cde"


def test_view_slice_start():
    assert view_slice(b"abcdef", 0, 3) == b"abc"


def test_view_slice_end():
    assert view_slice(b"abcdef", 4, 6) == b"ef"


def test_view_slice_empty():
    assert view_slice(b"abcdef", 3, 3) == b""


def test_find_pattern_none():
    assert find_pattern(b"hello", b"xyz") == []


def test_find_pattern_single():
    assert find_pattern(b"hello", b"ell") == [1]


def test_find_pattern_multiple():
    assert find_pattern(b"abcabc", b"abc") == [0, 3]


def test_find_pattern_overlapping():
    assert find_pattern(b"aaa", b"aa") == [0, 1]


def test_find_pattern_single_byte():
    assert find_pattern(b"abab", b"a") == [0, 2]
