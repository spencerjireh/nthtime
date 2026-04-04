from solution import HttpStatus, Color, Permission


def test_http_status_values():
    assert HttpStatus.OK == 200
    assert HttpStatus.NOT_FOUND == 404
    assert HttpStatus.ERROR == 500


def test_http_status_is_int():
    assert HttpStatus.OK + 1 == 201


def test_http_status_from_value():
    assert HttpStatus(200) == HttpStatus.OK


def test_color_values():
    assert Color.RED.value == "red"
    assert Color.GREEN.value == "green"
    assert Color.BLUE.value == "blue"


def test_color_is_primary_red():
    assert Color.RED.is_primary() is True


def test_color_is_primary_blue():
    assert Color.BLUE.is_primary() is True


def test_color_is_primary_green():
    assert Color.GREEN.is_primary() is False


def test_permission_combine():
    p = Permission.READ | Permission.WRITE
    assert Permission.READ in p
    assert Permission.WRITE in p
    assert Permission.EXECUTE not in p


def test_permission_values():
    assert Permission.READ.value == 1
    assert Permission.WRITE.value == 2
    assert Permission.EXECUTE.value == 4


def test_permission_all():
    p = Permission.READ | Permission.WRITE | Permission.EXECUTE
    assert Permission.READ in p
    assert Permission.EXECUTE in p


def test_color_iteration():
    members = list(Color)
    assert len(members) == 3
    assert Color.RED in members
