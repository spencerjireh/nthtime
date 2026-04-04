from solution import encode_base64, decode_base64, rot13, simple_checksum


def test_encode_base64_basic():
    assert encode_base64(b"Hello") == "SGVsbG8="


def test_encode_base64_empty():
    assert encode_base64(b"") == ""


def test_decode_base64_basic():
    assert decode_base64("SGVsbG8=") == b"Hello"


def test_decode_base64_empty():
    assert decode_base64("") == b""


def test_base64_round_trip():
    data = b"binary \x00\x01\xff data"
    assert decode_base64(encode_base64(data)) == data


def test_rot13_basic():
    assert rot13("Hello") == "Uryyb"


def test_rot13_lowercase():
    assert rot13("abc") == "nop"


def test_rot13_double_application():
    assert rot13(rot13("Hello, World!")) == "Hello, World!"


def test_rot13_preserves_non_alpha():
    assert rot13("123!@#") == "123!@#"


def test_rot13_mixed():
    assert rot13("Test 123") == "Grfg 123"


def test_simple_checksum_basic():
    assert simple_checksum(b"\x01\x02\x03") == 0


def test_simple_checksum_single():
    assert simple_checksum(b"\xff") == 255


def test_simple_checksum_empty():
    assert simple_checksum(b"") == 0


def test_simple_checksum_known():
    assert simple_checksum(b"\xaa\x55") == 0xFF


def test_simple_checksum_same_bytes():
    assert simple_checksum(b"\x42\x42") == 0
