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

const CHALLENGE = join(import.meta.dirname, '09-average-of-levels.json');

describe('Average of Levels', () => {
  let averageOfLevels: (root: TreeNode | null) => number[];
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ averageOfLevels: typeof averageOfLevels }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    averageOfLevels = mod.averageOfLevels;
  });

  afterAll(() => cleanup());

  it('computes averages for three levels', () => {
    expect(averageOfLevels(buildTree([3, 9, 20, null, null, 15, 7]))).toEqual([3.0, 14.5, 11.0]);
  });

  it('computes averages for different shape three levels', () => {
    expect(averageOfLevels(buildTree([3, 9, 20, 15, 7]))).toEqual([3.0, 14.5, 11.0]);
  });

  it('returns single average for single node', () => {
    expect(averageOfLevels(buildTree([1]))).toEqual([1.0]);
  });

  it('returns empty array for null root', () => {
    expect(averageOfLevels(null)).toEqual([]);
  });

  it('computes averages for two levels', () => {
    expect(averageOfLevels(buildTree([1, 2, 3]))).toEqual([1.0, 2.5]);
  });

  it('computes averages for left-skewed tree', () => {
    expect(averageOfLevels(buildTree([1, 2, null, 3]))).toEqual([1.0, 2.0, 3.0]);
  });
});
