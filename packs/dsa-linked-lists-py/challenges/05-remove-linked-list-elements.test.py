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


from solution import remove_elements


def test_remove_middle_and_end():
    head = from_list([1, 2, 6, 3, 4, 5, 6])
    result = remove_elements(head, 6)
    assert to_list(result) == [1, 2, 3, 4, 5]


def test_remove_from_empty():
    result = remove_elements(None, 1)
    assert result is None


def test_remove_all():
    head = from_list([7, 7, 7, 7])
    result = remove_elements(head, 7)
    assert result is None


def test_remove_head():
    head = from_list([1, 1, 2, 3])
    result = remove_elements(head, 1)
    assert to_list(result) == [2, 3]


def test_remove_none_present():
    head = from_list([1, 2, 3])
    result = remove_elements(head, 4)
    assert to_list(result) == [1, 2, 3]
