import time
import pytest
from solution import Timer, temporary_value


def test_timer_measures_elapsed():
    with Timer() as t:
        time.sleep(0.05)
    assert t.elapsed > 0


def test_timer_elapsed_reasonable():
    with Timer() as t:
        time.sleep(0.1)
    assert 0.05 < t.elapsed < 0.5


def test_timer_returns_self():
    timer = Timer()
    result = timer.__enter__()
    timer.__exit__(None, None, None)
    assert result is timer


def test_timer_initial_elapsed():
    t = Timer()
    assert t.elapsed == 0.0


def test_temporary_value_changes_attr():
    class Config:
        debug = False

    with temporary_value(Config, "debug", True) as cfg:
        assert cfg.debug is True


def test_temporary_value_restores_attr():
    class Config:
        debug = False

    with temporary_value(Config, "debug", True):
        pass
    assert Config.debug is False


def test_temporary_value_restores_on_exception():
    class Config:
        mode = "production"

    with pytest.raises(RuntimeError):
        with temporary_value(Config, "mode", "test"):
            raise RuntimeError("oops")

    assert Config.mode == "production"


def test_temporary_value_works_with_instances():
    class Settings:
        def __init__(self):
            self.volume = 50

    s = Settings()
    with temporary_value(s, "volume", 100) as obj:
        assert obj.volume == 100
        assert obj is s
    assert s.volume == 50


def test_temporary_value_yields_object():
    class Box:
        value = 0

    with temporary_value(Box, "value", 42) as b:
        assert b is Box
