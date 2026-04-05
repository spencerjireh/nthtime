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

const CHALLENGE = join(import.meta.dirname, '08-merge-two-binary-trees.json');

describe('Merge Two Binary Trees', () => {
  let mergeTrees: (
    root1: TreeNode | null,
    root2: TreeNode | null
  ) => TreeNode | null;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ mergeTrees: typeof mergeTrees }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    mergeTrees = mod.mergeTrees;
  });

  afterAll(() => cleanup());

  it('merges overlapping trees', () => {
    const result = mergeTrees(
      buildTree([1, 3, 2, 5]),
      buildTree([2, 1, 3, null, 4, null, 7])
    );
    expect(treeToList(result)).toEqual([3, 4, 5, 5, 4, null, 7]);
  });

  it('merges trees with different shapes', () => {
    const result = mergeTrees(buildTree([1]), buildTree([1, 2]));
    expect(treeToList(result)).toEqual([2, 2]);
  });

  it('returns second tree when first is null', () => {
    const result = mergeTrees(null, buildTree([1, 2, 3]));
    expect(treeToList(result)).toEqual([1, 2, 3]);
  });

  it('returns first tree when second is null', () => {
    const result = mergeTrees(buildTree([1, 2, 3]), null);
    expect(treeToList(result)).toEqual([1, 2, 3]);
  });

  it('returns null when both are null', () => {
    expect(mergeTrees(null, null)).toBeNull();
  });

  it('merges single nodes', () => {
    const result = mergeTrees(buildTree([5]), buildTree([3]));
    expect(treeToList(result)).toEqual([8]);
  });
});
