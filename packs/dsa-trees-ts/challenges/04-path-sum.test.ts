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

const CHALLENGE = join(import.meta.dirname, '04-path-sum.json');

describe('Path Sum', () => {
  let hasPathSum: (root: TreeNode | null, targetSum: number) => boolean;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ hasPathSum: typeof hasPathSum }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    hasPathSum = mod.hasPathSum;
  });

  afterAll(() => cleanup());

  it('returns true when path exists', () => {
    expect(
      hasPathSum(buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]), 22)
    ).toBe(true);
  });

  it('returns false when no path matches', () => {
    expect(hasPathSum(buildTree([1, 2, 3]), 5)).toBe(false);
  });

  it('returns false for empty tree', () => {
    expect(hasPathSum(null, 0)).toBe(false);
  });

  it('returns true for single node match', () => {
    expect(hasPathSum(buildTree([5]), 5)).toBe(true);
  });

  it('returns false for single node no match', () => {
    expect(hasPathSum(buildTree([5]), 1)).toBe(false);
  });

  it('returns true for left path', () => {
    expect(hasPathSum(buildTree([1, 2, 3]), 3)).toBe(true);
  });
});
