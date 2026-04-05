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


from solution import merge_two_lists


def test_merge_two_sorted():
    l1 = from_list([1, 2, 4])
    l2 = from_list([1, 3, 4])
    result = merge_two_lists(l1, l2)
    assert to_list(result) == [1, 1, 2, 3, 4, 4]


def test_merge_both_empty():
    result = merge_two_lists(None, None)
    assert result is None


def test_merge_one_empty():
    l2 = from_list([0])
    result = merge_two_lists(None, l2)
    assert to_list(result) == [0]


def test_merge_different_lengths():
    l1 = from_list([1, 3, 5, 7])
    l2 = from_list([2, 4])
    result = merge_two_lists(l1, l2)
    assert to_list(result) == [1, 2, 3, 4, 5, 7]


def test_merge_duplicates():
    l1 = from_list([1, 1, 1])
    l2 = from_list([1, 1, 1])
    result = merge_two_lists(l1, l2)
    assert to_list(result) == [1, 1, 1, 1, 1, 1]
