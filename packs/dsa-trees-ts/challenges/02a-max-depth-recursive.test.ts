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

const CHALLENGE = join(import.meta.dirname, '02a-max-depth-recursive.json');

describe('Max Depth (Recursive)', () => {
  let maxDepth: (root: TreeNode | null) => number;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ maxDepth: typeof maxDepth }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    maxDepth = mod.maxDepth;
  });

  afterAll(() => cleanup());

  it('returns 3 for a balanced tree', () => {
    expect(maxDepth(buildTree([3, 9, 20, null, null, 15, 7]))).toBe(3);
  });

  it('returns 2 for right-skewed tree', () => {
    expect(maxDepth(buildTree([1, null, 2]))).toBe(2);
  });

  it('returns 0 for empty tree', () => {
    expect(maxDepth(null)).toBe(0);
  });

  it('returns 1 for single node', () => {
    expect(maxDepth(buildTree([1]))).toBe(1);
  });

  it('returns 3 for left-skewed tree', () => {
    expect(maxDepth(buildTree([1, 2, null, 3]))).toBe(3);
  });
});
