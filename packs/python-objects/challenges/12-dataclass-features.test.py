import dataclasses
import pytest
from solution import Config, Priority, Tasks


def test_config_defaults():
    c = Config("localhost")
    assert c.host == "localhost"
    assert c.port == 8080


def test_config_custom_port():
    c = Config("example.com", 3000)
    assert c.port == 3000


def test_config_frozen():
    c = Config("localhost")
    with pytest.raises(dataclasses.FrozenInstanceError):
        c.host = "other"


def test_config_hashable():
    c = Config("localhost")
    assert hash(c) is not None
    s = {c}
    assert len(s) == 1


def test_priority_ordering():
    low = Priority(1, "low")
    high = Priority(2, "high")
    assert low < high


def test_priority_equal():
    a = Priority(1, "low")
    b = Priority(1, "low")
    assert a == b


def test_priority_sorting():
    items = [Priority(3, "high"), Priority(1, "low"), Priority(2, "med")]
    result = sorted(items)
    assert result[0].level == 1
    assert result[-1].level == 3


def test_tasks_add():
    t = Tasks("TODO")
    t.add("item 1")
    t.add("item 2")
    assert t.items == ["item 1", "item 2"]


def test_tasks_default_empty():
    t = Tasks("TODO")
    assert t.items == []


def test_tasks_independent_lists():
    t1 = Tasks("A")
    t2 = Tasks("B")
    t1.add("x")
    assert t2.items == []
