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


from solution import has_path_sum


def test_path_exists():
    root = build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1])
    assert has_path_sum(root, 22) is True


def test_no_path():
    root = build_tree([1, 2, 3])
    assert has_path_sum(root, 5) is False


def test_empty_tree():
    assert has_path_sum(None, 0) is False


def test_single_node_match():
    root = build_tree([5])
    assert has_path_sum(root, 5) is True


def test_single_node_no_match():
    root = build_tree([5])
    assert has_path_sum(root, 1) is False


def test_left_path():
    root = build_tree([1, 2, 3])
    assert has_path_sum(root, 3) is True
