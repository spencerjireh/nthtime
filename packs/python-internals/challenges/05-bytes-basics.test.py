from solution import string_to_bytes, bytes_to_string, xor_bytes, byte_frequency


def test_string_to_bytes_basic():
    assert string_to_bytes("hello") == b"hello"


def test_string_to_bytes_unicode():
    result = string_to_bytes("cafe")
    assert result == b"cafe"


def test_string_to_bytes_utf8_multibyte():
    result = string_to_bytes("\u00e9")
    assert result == b"\xc3\xa9"


def test_bytes_to_string_basic():
    assert bytes_to_string(b"hello") == "hello"


def test_round_trip():
    text = "hello world"
    assert bytes_to_string(string_to_bytes(text)) == text


def test_round_trip_latin1():
    text = "caf\u00e9"
    encoded = string_to_bytes(text, "latin-1")
    assert bytes_to_string(encoded, "latin-1") == text


def test_xor_bytes_basic():
    assert xor_bytes(b"\x01\x02", b"\x03\x04") == b"\x02\x06"


def test_xor_bytes_round_trip():
    data = b"secret"
    key = b"\xaa\xbb\xcc\xdd\xee\xff"
    encrypted = xor_bytes(data, key)
    assert xor_bytes(encrypted, key) == data


def test_xor_bytes_zeros():
    assert xor_bytes(b"\x00\x00", b"\xff\xff") == b"\xff\xff"


def test_byte_frequency_basic():
    freq = byte_frequency(b"aab")
    assert freq == {97: 2, 98: 1}


def test_byte_frequency_all_same():
    freq = byte_frequency(b"\x00\x00\x00")
    assert freq == {0: 3}


def test_byte_frequency_empty():
    freq = byte_frequency(b"")
    assert freq == {}
