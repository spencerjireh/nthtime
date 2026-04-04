import struct
from solution import pack_header, unpack_header, pack_point, read_records


def test_pack_header_basic():
    result = pack_header(1, 2, 256)
    assert result == b"\x01\x02\x01\x00"


def test_pack_header_zeros():
    result = pack_header(0, 0, 0)
    assert result == b"\x00\x00\x00\x00"


def test_pack_header_max_values():
    result = pack_header(255, 255, 65535)
    assert len(result) == 4


def test_unpack_header_basic():
    assert unpack_header(b"\x01\x02\x01\x00") == (1, 2, 256)


def test_unpack_header_zeros():
    assert unpack_header(b"\x00\x00\x00\x00") == (0, 0, 0)


def test_header_round_trip():
    version, msg_type, length = 3, 10, 1024
    packed = pack_header(version, msg_type, length)
    assert unpack_header(packed) == (version, msg_type, length)


def test_pack_point_basic():
    result = pack_point(1.0, 2.0)
    assert len(result) == 8


def test_pack_point_round_trip():
    data = pack_point(3.14, 2.72)
    x, y = struct.unpack("<ff", data)
    assert abs(x - 3.14) < 0.01
    assert abs(y - 2.72) < 0.01


def test_pack_point_zeros():
    data = pack_point(0.0, 0.0)
    x, y = struct.unpack("<ff", data)
    assert x == 0.0
    assert y == 0.0


def test_read_records_single():
    data = struct.pack(">HH", 258, 772)
    records = list(read_records(data, ">HH"))
    assert records == [(258, 772)]


def test_read_records_multiple():
    data = struct.pack(">BB", 1, 2) + struct.pack(">BB", 3, 4)
    records = list(read_records(data, ">BB"))
    assert records == [(1, 2), (3, 4)]


def test_read_records_empty():
    records = list(read_records(b"", ">HH"))
    assert records == []


def test_read_records_trailing_bytes():
    data = struct.pack(">HH", 1, 2) + b"\xff"
    records = list(read_records(data, ">HH"))
    assert records == [(1, 2)]


def test_read_records_is_generator():
    gen = read_records(b"\x01\x02", ">BB")
    assert hasattr(gen, "__next__")
