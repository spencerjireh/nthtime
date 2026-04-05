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

const CHALLENGE = join(import.meta.dirname, '03-min-depth.json');

describe('Minimum Depth', () => {
  let minDepth: (root: TreeNode | null) => number;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ minDepth: typeof minDepth }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    minDepth = mod.minDepth;
  });

  afterAll(() => cleanup());

  it('returns 2 for a balanced tree', () => {
    expect(minDepth(buildTree([3, 9, 20, null, null, 15, 7]))).toBe(2);
  });

  it('returns 5 for right-skewed tree', () => {
    expect(minDepth(buildTree([2, null, 3, null, 4, null, 5, null, 6]))).toBe(5);
  });

  it('returns 0 for empty tree', () => {
    expect(minDepth(null)).toBe(0);
  });

  it('returns 1 for single node', () => {
    expect(minDepth(buildTree([1]))).toBe(1);
  });

  it('returns 2 when left leaf is shorter', () => {
    expect(minDepth(buildTree([1, 2, 3, null, null, 4, 5]))).toBe(2);
  });
});
