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


from solution import max_depth


def test_balanced_tree():
    root = build_tree([3, 9, 20, None, None, 15, 7])
    assert max_depth(root) == 3


def test_right_skewed():
    root = build_tree([1, None, 2])
    assert max_depth(root) == 2


def test_empty_tree():
    assert max_depth(None) == 0


def test_single_node():
    root = build_tree([1])
    assert max_depth(root) == 1


def test_left_skewed():
    root = build_tree([1, 2, None, 3])
    assert max_depth(root) == 3
