import pytest
from solution import Serializer, JsonSerializer, CsvSerializer


def test_serializer_cannot_be_instantiated():
    with pytest.raises(TypeError):
        Serializer()


def test_json_serialize_dict():
    js = JsonSerializer()
    result = js.serialize({"a": 1, "b": 2})
    assert '"a"' in result
    assert '"b"' in result


def test_json_deserialize_dict():
    js = JsonSerializer()
    result = js.deserialize('{"a": 1, "b": 2}')
    assert result == {"a": 1, "b": 2}


def test_json_round_trip():
    js = JsonSerializer()
    data = {"name": "Alice", "scores": [95, 87, 92]}
    assert js.deserialize(js.serialize(data)) == data


def test_json_serialize_list():
    js = JsonSerializer()
    result = js.serialize([1, 2, 3])
    assert js.deserialize(result) == [1, 2, 3]


def test_csv_serialize():
    cs = CsvSerializer()
    data = [{"name": "Alice", "age": "30"}, {"name": "Bob", "age": "25"}]
    result = cs.serialize(data)
    lines = result.split("\n")
    assert lines[0] == "name,age"
    assert lines[1] == "Alice,30"
    assert lines[2] == "Bob,25"


def test_csv_deserialize():
    cs = CsvSerializer()
    text = "name,age\nAlice,30\nBob,25"
    result = cs.deserialize(text)
    assert len(result) == 2
    assert result[0] == {"name": "Alice", "age": "30"}
    assert result[1] == {"name": "Bob", "age": "25"}


def test_csv_round_trip():
    cs = CsvSerializer()
    data = [{"x": "1", "y": "2"}, {"x": "3", "y": "4"}]
    assert cs.deserialize(cs.serialize(data)) == data


def test_csv_serialize_empty():
    cs = CsvSerializer()
    assert cs.serialize([]) == ""


def test_csv_deserialize_empty():
    cs = CsvSerializer()
    assert cs.deserialize("") == []


def test_json_isinstance():
    js = JsonSerializer()
    assert isinstance(js, Serializer)
    assert isinstance(js, JsonSerializer)


def test_csv_isinstance():
    cs = CsvSerializer()
    assert isinstance(cs, Serializer)
    assert isinstance(cs, CsvSerializer)
