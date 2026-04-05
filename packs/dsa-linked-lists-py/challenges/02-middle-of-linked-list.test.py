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


from solution import middle_node


def test_middle_odd():
    head = from_list([1, 2, 3, 4, 5])
    result = middle_node(head)
    assert result.val == 3


def test_middle_even():
    head = from_list([1, 2, 3, 4, 5, 6])
    result = middle_node(head)
    assert result.val == 4


def test_middle_single():
    head = from_list([1])
    result = middle_node(head)
    assert result.val == 1


def test_middle_two():
    head = from_list([1, 2])
    result = middle_node(head)
    assert result.val == 2
