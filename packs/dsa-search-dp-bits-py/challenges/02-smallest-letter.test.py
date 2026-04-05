from solution import next_greatest_letter


def test_target_before_all():
    assert next_greatest_letter(["c", "f", "j"], "a") == "c"


def test_target_equals_first():
    assert next_greatest_letter(["c", "f", "j"], "c") == "f"


def test_target_between_letters():
    assert next_greatest_letter(["c", "f", "j"], "d") == "f"


def test_wrap_around():
    assert next_greatest_letter(["x", "x", "y", "y"], "z") == "x"


def test_target_equals_last():
    assert next_greatest_letter(["c", "f", "j"], "j") == "c"


def test_all_same_letters():
    assert next_greatest_letter(["a", "a", "a"], "a") == "a"


def test_two_letters():
    assert next_greatest_letter(["a", "b"], "a") == "b"
