from solution import read_lines, filter_comments, parse_ints, pipeline


def test_read_lines_basic():
    result = list(read_lines("  hello \n\n world "))
    assert result == ["hello", "world"]


def test_read_lines_strips_whitespace():
    result = list(read_lines("  a  \n  b  "))
    assert result == ["a", "b"]


def test_read_lines_skips_empty():
    result = list(read_lines("\n\nhello\n\n"))
    assert result == ["hello"]


def test_read_lines_single():
    result = list(read_lines("only"))
    assert result == ["only"]


def test_filter_comments_basic():
    result = list(filter_comments(["# skip", "keep", "# also skip"]))
    assert result == ["keep"]


def test_filter_comments_no_comments():
    result = list(filter_comments(["a", "b", "c"]))
    assert result == ["a", "b", "c"]


def test_filter_comments_all_comments():
    result = list(filter_comments(["# a", "# b"]))
    assert result == []


def test_filter_comments_hash_in_middle():
    result = list(filter_comments(["not # a comment"]))
    assert result == ["not # a comment"]


def test_parse_ints_basic():
    result = list(parse_ints(["1", "2", "3"]))
    assert result == [1, 2, 3]


def test_parse_ints_negative():
    result = list(parse_ints(["-5", "10"]))
    assert result == [-5, 10]


def test_parse_ints_empty():
    result = list(parse_ints([]))
    assert result == []


def test_pipeline_basic():
    text = "# comment\n  10  \n20\n# another\n30"
    assert pipeline(text) == 60


def test_pipeline_no_comments():
    text = "1\n2\n3"
    assert pipeline(text) == 6


def test_pipeline_all_comments():
    text = "# a\n# b\n# c"
    assert pipeline(text) == 0


def test_pipeline_with_whitespace():
    text = "  5  \n\n  # skip  \n  15  \n"
    assert pipeline(text) == 20
