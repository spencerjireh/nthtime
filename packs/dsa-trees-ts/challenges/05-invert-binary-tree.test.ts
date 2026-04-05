import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(values: (number | null)[]): TreeNode | null {
  if (!values.length || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const queue: TreeNode[] = [root];
  let i = 1;
  while (queue.length && i < values.length) {
    const node = queue.shift()!;
    if (i < values.length && values[i] !== null) {
      node.left = new TreeNode(values[i] as number);
      queue.push(node.left);
    }
    i++;
    if (i < values.length && values[i] !== null) {
      node.right = new TreeNode(values[i] as number);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

function treeToList(root: TreeNode | null): (number | null)[] {
  if (!root) return [];
  const result: (number | null)[] = [];
  const queue: (TreeNode | null)[] = [root];
  while (queue.length) {
    const node = queue.shift()!;
    if (node) {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push(null);
    }
  }
  while (result.length && result[result.length - 1] === null) result.pop();
  return result;
}

const CHALLENGE = join(import.meta.dirname, '05-invert-binary-tree.json');

describe('Invert Binary Tree', () => {
  let invertTree: (root: TreeNode | null) => TreeNode | null;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ invertTree: typeof invertTree }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    invertTree = mod.invertTree;
  });

  afterAll(() => cleanup());

  it('inverts a full tree', () => {
    const result = invertTree(buildTree([4, 2, 7, 1, 3, 6, 9]));
    expect(treeToList(result)).toEqual([4, 7, 2, 9, 6, 3, 1]);
  });

  it('inverts a small tree', () => {
    const result = invertTree(buildTree([2, 1, 3]));
    expect(treeToList(result)).toEqual([2, 3, 1]);
  });

  it('returns null for empty tree', () => {
    expect(invertTree(null)).toBeNull();
  });

  it('returns single node unchanged', () => {
    const result = invertTree(buildTree([1]));
    expect(treeToList(result)).toEqual([1]);
  });

  it('moves left-only child to right', () => {
    const result = invertTree(buildTree([1, 2]));
    expect(treeToList(result)).toEqual([1, null, 2]);
  });
});
