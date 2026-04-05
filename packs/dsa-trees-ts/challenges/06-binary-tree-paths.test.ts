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

const CHALLENGE = join(import.meta.dirname, '06-binary-tree-paths.json');

describe('Binary Tree Paths', () => {
  let binaryTreePaths: (root: TreeNode | null) => string[];
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ binaryTreePaths: typeof binaryTreePaths }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    binaryTreePaths = mod.binaryTreePaths;
  });

  afterAll(() => cleanup());

  it('returns multiple paths', () => {
    expect(binaryTreePaths(buildTree([1, 2, 3, null, 5])).sort()).toEqual(
      ['1->2->5', '1->3'].sort()
    );
  });

  it('returns single path for single node', () => {
    expect(binaryTreePaths(buildTree([1]))).toEqual(['1']);
  });

  it('returns empty array for null root', () => {
    expect(binaryTreePaths(null)).toEqual([]);
  });

  it('returns single path for left-only chain', () => {
    expect(binaryTreePaths(buildTree([1, 2, null, 3]))).toEqual(['1->2->3']);
  });

  it('returns two paths for full tree', () => {
    expect(binaryTreePaths(buildTree([1, 2, 3])).sort()).toEqual(['1->2', '1->3'].sort());
  });
});
