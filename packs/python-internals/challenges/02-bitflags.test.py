from solution import Permissions


def test_grant_single():
    p = Permissions()
    p.grant(Permissions.READ)
    assert p.has(Permissions.READ) is True


def test_grant_multiple():
    p = Permissions()
    p.grant(Permissions.READ)
    p.grant(Permissions.WRITE)
    assert p.has(Permissions.READ) is True
    assert p.has(Permissions.WRITE) is True


def test_has_not_granted():
    p = Permissions()
    p.grant(Permissions.READ)
    assert p.has(Permissions.ADMIN) is False


def test_revoke():
    p = Permissions()
    p.grant(Permissions.READ)
    p.grant(Permissions.WRITE)
    p.revoke(Permissions.READ)
    assert p.has(Permissions.READ) is False
    assert p.has(Permissions.WRITE) is True


def test_revoke_not_set():
    p = Permissions()
    p.revoke(Permissions.ADMIN)
    assert p.has(Permissions.ADMIN) is False


def test_to_list_empty():
    p = Permissions()
    assert p.to_list() == []


def test_to_list_order():
    p = Permissions()
    p.grant(Permissions.ADMIN)
    p.grant(Permissions.READ)
    assert p.to_list() == ["READ", "ADMIN"]


def test_to_list_all():
    p = Permissions(15)
    assert p.to_list() == ["READ", "WRITE", "EXECUTE", "ADMIN"]


def test_from_list_single():
    p = Permissions.from_list(["WRITE"])
    assert p.has(Permissions.WRITE) is True
    assert p.has(Permissions.READ) is False


def test_from_list_multiple():
    p = Permissions.from_list(["ADMIN", "EXECUTE"])
    assert p.has(Permissions.ADMIN) is True
    assert p.has(Permissions.EXECUTE) is True
    assert p.to_list() == ["EXECUTE", "ADMIN"]


def test_from_list_round_trip():
    original = ["READ", "WRITE", "ADMIN"]
    p = Permissions.from_list(original)
    assert p.to_list() == ["READ", "WRITE", "ADMIN"]
