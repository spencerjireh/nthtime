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


from solution import is_palindrome


def test_palindrome_even():
    head = from_list([1, 2, 2, 1])
    assert is_palindrome(head) is True


def test_not_palindrome():
    head = from_list([1, 2])
    assert is_palindrome(head) is False


def test_palindrome_single():
    head = from_list([1])
    assert is_palindrome(head) is True


def test_palindrome_odd():
    head = from_list([1, 2, 3, 2, 1])
    assert is_palindrome(head) is True


def test_not_palindrome_longer():
    head = from_list([1, 2, 3, 4])
    assert is_palindrome(head) is False


def test_palindrome_empty():
    assert is_palindrome(None) is True


def test_palindrome_two_same():
    head = from_list([1, 1])
    assert is_palindrome(head) is True
