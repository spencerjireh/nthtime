import pytest
from solution import DatabaseConnection, suppress, stack


def test_db_connected_inside():
    with DatabaseConnection() as db:
        assert db.connected is True


def test_db_committed_on_success():
    with DatabaseConnection() as db:
        pass
    assert db.committed is True
    assert db.rolled_back is False


def test_db_not_connected_after_exit():
    with DatabaseConnection() as db:
        pass
    assert db.connected is False


def test_db_rollback_on_exception():
    db = DatabaseConnection()
    with pytest.raises(RuntimeError):
        with db:
            raise RuntimeError("failure")
    assert db.rolled_back is True
    assert db.committed is False
    assert db.connected is False


def test_db_initial_state():
    db = DatabaseConnection()
    assert db.connected is False
    assert db.committed is False
    assert db.rolled_back is False


def test_suppress_catches_expected():
    with suppress(ValueError):
        raise ValueError("ignored")


def test_suppress_catches_multiple_types():
    with suppress(ValueError, TypeError):
        raise TypeError("also ignored")


def test_suppress_does_not_catch_other():
    with pytest.raises(RuntimeError):
        with suppress(ValueError):
            raise RuntimeError("not suppressed")


def test_suppress_no_exception():
    with suppress(ValueError):
        x = 1 + 1
    assert x == 2


def test_stack_enters_all():
    with stack(DatabaseConnection(), DatabaseConnection()) as managers:
        assert len(managers) == 2
        assert all(m.connected for m in managers)


def test_stack_exits_all():
    db1 = DatabaseConnection()
    db2 = DatabaseConnection()
    with stack(db1, db2):
        pass
    assert not db1.connected
    assert not db2.connected


def test_stack_yields_list():
    with stack(DatabaseConnection()) as managers:
        assert isinstance(managers, list)
        assert len(managers) == 1


def test_stack_empty():
    with stack() as managers:
        assert managers == []
