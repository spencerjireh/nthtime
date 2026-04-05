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


from solution import merge_trees


def test_merge_overlapping():
    root1 = build_tree([1, 3, 2, 5])
    root2 = build_tree([2, 1, 3, None, 4, None, 7])
    result = merge_trees(root1, root2)
    assert tree_to_list(result) == [3, 4, 5, 5, 4, None, 7]


def test_merge_different_shapes():
    root1 = build_tree([1])
    root2 = build_tree([1, 2])
    result = merge_trees(root1, root2)
    assert tree_to_list(result) == [2, 2]


def test_merge_with_none_first():
    root2 = build_tree([1, 2, 3])
    result = merge_trees(None, root2)
    assert tree_to_list(result) == [1, 2, 3]


def test_merge_with_none_second():
    root1 = build_tree([1, 2, 3])
    result = merge_trees(root1, None)
    assert tree_to_list(result) == [1, 2, 3]


def test_merge_both_none():
    result = merge_trees(None, None)
    assert result is None


def test_merge_single_nodes():
    root1 = build_tree([5])
    root2 = build_tree([3])
    result = merge_trees(root1, root2)
    assert tree_to_list(result) == [8]
