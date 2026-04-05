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

const CHALLENGE = join(import.meta.dirname, '01-reverse-linked-list.json');

describe('Reverse Linked List', () => {
  let reverseList: (head: ListNode | null) => ListNode | null;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ reverseList: typeof reverseList }>(
      join(tmp.tmpDir, 'solution.ts'),
    );
    reverseList = mod.reverseList;
  });

  afterAll(() => cleanup());

  it('reverses a list of five elements', () => {
    expect(toList(reverseList(fromList([1, 2, 3, 4, 5])))).toEqual([5, 4, 3, 2, 1]);
  });

  it('reverses a list of two elements', () => {
    expect(toList(reverseList(fromList([1, 2])))).toEqual([2, 1]);
  });

  it('returns null for an empty list', () => {
    expect(reverseList(null)).toBeNull();
  });

  it('returns the same node for a single element', () => {
    expect(toList(reverseList(fromList([1])))).toEqual([1]);
  });
});
