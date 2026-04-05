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


from solution import reverse_list


def test_reverse_multiple():
    head = from_list([1, 2, 3, 4, 5])
    result = reverse_list(head)
    assert to_list(result) == [5, 4, 3, 2, 1]


def test_reverse_two():
    head = from_list([1, 2])
    result = reverse_list(head)
    assert to_list(result) == [2, 1]


def test_reverse_empty():
    result = reverse_list(None)
    assert result is None


def test_reverse_single():
    head = from_list([1])
    result = reverse_list(head)
    assert to_list(result) == [1]
