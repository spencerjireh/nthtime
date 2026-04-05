class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def to_list(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result


def from_list(lst):
    dummy = ListNode(0)
    curr = dummy
    for val in lst:
        curr.next = ListNode(val)
        curr = curr.next
    return dummy.next


from solution import delete_duplicates


def test_remove_duplicates_basic():
    head = from_list([1, 1, 2])
    result = delete_duplicates(head)
    assert to_list(result) == [1, 2]


def test_remove_duplicates_multiple():
    head = from_list([1, 1, 2, 3, 3])
    result = delete_duplicates(head)
    assert to_list(result) == [1, 2, 3]


def test_remove_duplicates_empty():
    result = delete_duplicates(None)
    assert result is None


def test_remove_duplicates_no_duplicates():
    head = from_list([1, 2, 3])
    result = delete_duplicates(head)
    assert to_list(result) == [1, 2, 3]


def test_remove_duplicates_all_same():
    head = from_list([1, 1, 1, 1])
    result = delete_duplicates(head)
    assert to_list(result) == [1]


def test_remove_duplicates_single():
    head = from_list([1])
    result = delete_duplicates(head)
    assert to_list(result) == [1]
