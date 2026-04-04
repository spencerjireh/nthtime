from solution import format_price, build_table_row, pluralize


def test_format_price_default_currency():
    assert format_price(12.5) == "USD 12.50"


def test_format_price_custom_currency():
    assert format_price(9.99, currency="EUR") == "EUR 9.99"


def test_format_price_zero():
    assert format_price(0) == "USD 0.00"


def test_format_price_large_number():
    assert format_price(1234.5, currency="GBP") == "GBP 1234.50"


def test_build_table_row_basic():
    result = build_table_row(["Name", "Age"], [10, 3])
    assert result == "| Name       | Age |"


def test_build_table_row_single_column():
    result = build_table_row(["Title"], [8])
    assert result == "| Title    |"


def test_build_table_row_exact_width():
    result = build_table_row(["Hi"], [2])
    assert result == "| Hi |"


def test_pluralize_singular():
    assert pluralize("apple", 1) == "1 apple"


def test_pluralize_plural():
    assert pluralize("apple", 5) == "5 apples"


def test_pluralize_zero():
    assert pluralize("item", 0) == "0 items"


def test_pluralize_large_count():
    assert pluralize("cat", 100) == "100 cats"
