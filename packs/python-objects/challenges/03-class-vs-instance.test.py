from solution import Counter


def test_instance_count_tracks_creations():
    Counter.instance_count = 0
    c1 = Counter("a")
    assert Counter.instance_count == 1
    c2 = Counter("b")
    assert Counter.instance_count == 2


def test_increment_per_instance():
    c = Counter("hits")
    assert c.increment() == 1
    assert c.increment() == 2
    assert c.increment() == 3


def test_increment_independent():
    c1 = Counter("a")
    c2 = Counter("b")
    c1.increment()
    c1.increment()
    c2.increment()
    assert c1.value == 2
    assert c2.value == 1


def test_reset_all():
    Counter.instance_count = 0
    Counter("a")
    Counter("b")
    assert Counter.instance_count == 2
    Counter.reset_all()
    assert Counter.instance_count == 0


def test_is_valid_name_valid():
    assert Counter.is_valid_name("hits") is True


def test_is_valid_name_empty():
    assert Counter.is_valid_name("") is False


def test_is_valid_name_non_string():
    assert Counter.is_valid_name(42) is False
    assert Counter.is_valid_name(None) is False
