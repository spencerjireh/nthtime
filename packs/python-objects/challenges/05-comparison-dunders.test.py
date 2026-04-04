from solution import Version


def test_equal_versions():
    assert Version(1, 2, 3) == Version(1, 2, 3)


def test_not_equal():
    assert Version(1, 2, 3) != Version(1, 2, 4)


def test_lt_major():
    assert Version(1, 0, 0) < Version(2, 0, 0)


def test_lt_minor():
    assert Version(1, 2, 0) < Version(1, 3, 0)


def test_lt_patch():
    assert Version(1, 2, 3) < Version(1, 2, 4)


def test_gt():
    assert Version(2, 0, 0) > Version(1, 9, 9)


def test_le():
    assert Version(1, 0, 0) <= Version(1, 0, 0)
    assert Version(1, 0, 0) <= Version(1, 0, 1)


def test_ge():
    assert Version(2, 0, 0) >= Version(2, 0, 0)
    assert Version(2, 0, 0) >= Version(1, 9, 9)


def test_repr():
    assert repr(Version(1, 2, 3)) == "Version(1, 2, 3)"
