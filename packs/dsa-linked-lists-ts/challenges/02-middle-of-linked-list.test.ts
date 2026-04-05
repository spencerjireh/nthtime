import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function fromList(arr: number[]): ListNode | null {
  const dummy = new ListNode(0);
  let curr = dummy;
  for (const val of arr) {
    curr.next = new ListNode(val);
    curr = curr.next;
  }
  return dummy.next;
}

const CHALLENGE = join(import.meta.dirname, '02-middle-of-linked-list.json');

describe('Middle of Linked List', () => {
  let middleNode: (head: ListNode | null) => ListNode | null;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ middleNode: typeof middleNode }>(
      join(tmp.tmpDir, 'solution.ts'),
    );
    middleNode = mod.middleNode;
  });

  afterAll(() => cleanup());

  it('returns the middle node for an odd-length list', () => {
    const result = middleNode(fromList([1, 2, 3, 4, 5]));
    expect(result!.val).toBe(3);
  });

  it('returns the second middle for an even-length list', () => {
    const result = middleNode(fromList([1, 2, 3, 4, 5, 6]));
    expect(result!.val).toBe(4);
  });

  it('returns the only node for a single-element list', () => {
    const result = middleNode(fromList([1]));
    expect(result!.val).toBe(1);
  });

  it('returns the second node for a two-element list', () => {
    const result = middleNode(fromList([1, 2]));
    expect(result!.val).toBe(2);
  });
});
