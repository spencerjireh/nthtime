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

function toList(head: ListNode | null): number[] {
  const result: number[] = [];
  while (head) {
    result.push(head.val);
    head = head.next;
  }
  return result;
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

const CHALLENGE = join(import.meta.dirname, '03a-linked-list-cycle-floyd.json');

describe('Linked List Cycle (Floyd)', () => {
  let hasCycle: (head: ListNode | null) => boolean;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ hasCycle: typeof hasCycle }>(
      join(tmp.tmpDir, 'solution.ts'),
    );
    hasCycle = mod.hasCycle;
  });

  afterAll(() => cleanup());

  it('detects a cycle', () => {
    const a = new ListNode(1);
    const b = new ListNode(2);
    const c = new ListNode(3);
    a.next = b;
    b.next = c;
    c.next = b;
    expect(hasCycle(a)).toBe(true);
  });

  it('returns false for no cycle', () => {
    expect(hasCycle(fromList([1, 2, 3]))).toBe(false);
  });

  it('returns false for an empty list', () => {
    expect(hasCycle(null)).toBe(false);
  });

  it('returns false for a single node without a cycle', () => {
    expect(hasCycle(new ListNode(1))).toBe(false);
  });

  it('detects a self-cycle on a single node', () => {
    const head = new ListNode(1);
    head.next = head;
    expect(hasCycle(head)).toBe(true);
  });

  it('detects a cycle at the tail', () => {
    const a = new ListNode(1);
    const b = new ListNode(2);
    const c = new ListNode(3);
    const d = new ListNode(4);
    a.next = b;
    b.next = c;
    c.next = d;
    d.next = b;
    expect(hasCycle(a)).toBe(true);
  });
});
