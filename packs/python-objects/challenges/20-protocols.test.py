from solution import Document, Report, Printable, Comparable, print_all, find_min


def test_document_to_string():
    d = Document("Readme", "Hello world")
    assert d.to_string() == "Readme: Hello world"


def test_document_attributes():
    d = Document("Title", "Body")
    assert d.title == "Title"
    assert d.body == "Body"


def test_report_to_string():
    r = Report("Sales", [1, 2, 3])
    assert r.to_string() == "Report: Sales (3 items)"


def test_report_empty_data():
    r = Report("Empty", [])
    assert r.to_string() == "Report: Empty (0 items)"


def test_report_attributes():
    r = Report("Q1", [10, 20])
    assert r.title == "Q1"
    assert r.data == [10, 20]


def test_print_all_mixed():
    d = Document("Readme", "Hello world")
    r = Report("Sales", [1, 2, 3])
    result = print_all([d, r])
    assert result == "Readme: Hello world\nReport: Sales (3 items)"


def test_print_all_single():
    d = Document("Note", "content")
    assert print_all([d]) == "Note: content"


def test_print_all_documents_only():
    d1 = Document("A", "first")
    d2 = Document("B", "second")
    result = print_all([d1, d2])
    assert result == "A: first\nB: second"


def test_find_min_integers():
    assert find_min([3, 1, 4, 1, 5]) == 1


def test_find_min_strings():
    assert find_min(["banana", "apple", "cherry"]) == "apple"


def test_find_min_single():
    assert find_min([42]) == 42


def test_find_min_custom_comparable():
    class Box:
        def __init__(self, size):
            self.size = size

        def __lt__(self, other):
            return self.size < other.size

    boxes = [Box(10), Box(3), Box(7)]
    result = find_min(boxes)
    assert result.size == 3


def test_document_does_not_inherit_printable():
    assert Printable not in Document.__mro__


def test_report_does_not_inherit_printable():
    assert Printable not in Report.__mro__
