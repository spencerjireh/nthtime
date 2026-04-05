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

const CHALLENGE = join(import.meta.dirname, '07-subtree-of-another.json');

describe('Subtree of Another Tree', () => {
  let isSubtree: (root: TreeNode | null, subRoot: TreeNode | null) => boolean;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ isSubtree: typeof isSubtree }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    isSubtree = mod.isSubtree;
  });

  afterAll(() => cleanup());

  it('returns true when subtree exists', () => {
    expect(isSubtree(buildTree([3, 4, 5, 1, 2]), buildTree([4, 1, 2]))).toBe(true);
  });

  it('returns false when subtree does not match', () => {
    expect(
      isSubtree(
        buildTree([3, 4, 5, 1, 2, null, null, null, null, 0]),
        buildTree([4, 1, 2])
      )
    ).toBe(false);
  });

  it('returns true for single node subtree', () => {
    expect(isSubtree(buildTree([1, 2, 3]), buildTree([2]))).toBe(true);
  });

  it('returns true when root equals subtree', () => {
    expect(isSubtree(buildTree([1, 2, 3]), buildTree([1, 2, 3]))).toBe(true);
  });

  it('returns false for empty root', () => {
    expect(isSubtree(null, buildTree([1]))).toBe(false);
  });
});
