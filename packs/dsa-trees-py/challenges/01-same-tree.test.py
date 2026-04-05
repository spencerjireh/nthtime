from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def build_tree(values):
    """Build binary tree from level-order list. None means no node."""
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = deque([root])
    i = 1
    while queue and i < len(values):
        node = queue.popleft()
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1
    return root


def tree_to_list(root):
    """Convert tree to level-order list (with None for missing nodes)."""
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    while result and result[-1] is None:
        result.pop()
    return result


from solution import is_same_tree


def test_same_trees():
    p = build_tree([1, 2, 3])
    q = build_tree([1, 2, 3])
    assert is_same_tree(p, q) is True


def test_different_structure():
    p = build_tree([1, 2])
    q = build_tree([1, None, 2])
    assert is_same_tree(p, q) is False


def test_both_empty():
    assert is_same_tree(None, None) is True


def test_one_empty():
    p = build_tree([1])
    assert is_same_tree(p, None) is False


def test_different_values():
    p = build_tree([1, 2, 3])
    q = build_tree([1, 2, 4])
    assert is_same_tree(p, q) is False


def test_single_node_same():
    p = build_tree([1])
    q = build_tree([1])
    assert is_same_tree(p, q) is True
