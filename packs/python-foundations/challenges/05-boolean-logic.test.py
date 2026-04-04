from solution import can_vote, classify_number


def test_can_vote_yes():
    assert can_vote(21, True) is True
    assert can_vote(18, True) is True


def test_can_vote_underage():
    assert can_vote(16, True) is False
    assert can_vote(17, True) is False


def test_can_vote_not_citizen():
    assert can_vote(21, False) is False
    assert can_vote(30, False) is False


def test_can_vote_both_false():
    assert can_vote(10, False) is False


def test_classify_positive():
    assert classify_number(5) == "positive"
    assert classify_number(1) == "positive"
    assert classify_number(100) == "positive"


def test_classify_negative():
    assert classify_number(-3) == "negative"
    assert classify_number(-1) == "negative"
    assert classify_number(-100) == "negative"


def test_classify_zero():
    assert classify_number(0) == "zero"
