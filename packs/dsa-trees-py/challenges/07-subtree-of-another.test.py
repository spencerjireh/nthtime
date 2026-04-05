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


from solution import is_subtree


def test_subtree_exists():
    root = build_tree([3, 4, 5, 1, 2])
    sub = build_tree([4, 1, 2])
    assert is_subtree(root, sub) is True


def test_subtree_not_match():
    root = build_tree([3, 4, 5, 1, 2, None, None, None, None, 0])
    sub = build_tree([4, 1, 2])
    assert is_subtree(root, sub) is False


def test_single_node_subtree():
    root = build_tree([1, 2, 3])
    sub = build_tree([2])
    assert is_subtree(root, sub) is True


def test_root_is_subtree():
    root = build_tree([1, 2, 3])
    sub = build_tree([1, 2, 3])
    assert is_subtree(root, sub) is True


def test_empty_root():
    sub = build_tree([1])
    assert is_subtree(None, sub) is False
