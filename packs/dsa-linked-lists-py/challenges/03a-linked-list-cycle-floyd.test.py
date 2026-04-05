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


from solution import has_cycle


def test_cycle_exists():
    a, b, c = ListNode(1), ListNode(2), ListNode(3)
    a.next = b
    b.next = c
    c.next = b
    assert has_cycle(a) is True


def test_no_cycle():
    head = from_list([1, 2, 3])
    assert has_cycle(head) is False


def test_empty_list():
    assert has_cycle(None) is False


def test_single_node_no_cycle():
    head = ListNode(1)
    assert has_cycle(head) is False


def test_single_node_self_cycle():
    head = ListNode(1)
    head.next = head
    assert has_cycle(head) is True


def test_cycle_at_tail():
    a, b, c, d = ListNode(1), ListNode(2), ListNode(3), ListNode(4)
    a.next = b
    b.next = c
    c.next = d
    d.next = b
    assert has_cycle(a) is True
