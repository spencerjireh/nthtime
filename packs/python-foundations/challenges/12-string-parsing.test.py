from solution import parse_csv_line, extract_domain, parse_key_value


def test_parse_csv_line_basic():
    assert parse_csv_line("a,b,c") == ["a", "b", "c"]


def test_parse_csv_line_with_spaces():
    assert parse_csv_line("a, b , c") == ["a", "b", "c"]


def test_parse_csv_line_single_field():
    assert parse_csv_line("hello") == ["hello"]


def test_extract_domain_basic():
    assert extract_domain("user@example.com") == "example.com"


def test_extract_domain_subdomain():
    assert extract_domain("admin@mail.example.org") == "mail.example.org"


def test_extract_domain_plus_addressing():
    assert extract_domain("user+tag@gmail.com") == "gmail.com"


def test_parse_key_value_basic():
    assert parse_key_value("x=1,y=2") == {"x": "1", "y": "2"}


def test_parse_key_value_custom_separator():
    assert parse_key_value("x:1,y:2", sep=":") == {"x": "1", "y": "2"}


def test_parse_key_value_with_spaces():
    assert parse_key_value("key = val, name = test") == {"key": "val", "name": "test"}


def test_parse_key_value_single_pair():
    assert parse_key_value("host=localhost") == {"host": "localhost"}
