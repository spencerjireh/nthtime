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

const CHALLENGE = join(import.meta.dirname, '05-remove-linked-list-elements.json');

describe('Remove Linked List Elements', () => {
  let removeElements: (head: ListNode | null, val: number) => ListNode | null;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ removeElements: typeof removeElements }>(
      join(tmp.tmpDir, 'solution.ts'),
    );
    removeElements = mod.removeElements;
  });

  afterAll(() => cleanup());

  it('removes elements from the middle and end', () => {
    expect(toList(removeElements(fromList([1, 2, 6, 3, 4, 5, 6]), 6))).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns null for an empty list', () => {
    expect(removeElements(null, 1)).toBeNull();
  });

  it('removes all elements when all match', () => {
    expect(removeElements(fromList([7, 7, 7, 7]), 7)).toBeNull();
  });

  it('removes elements at the head', () => {
    expect(toList(removeElements(fromList([1, 1, 2, 3]), 1))).toEqual([2, 3]);
  });

  it('returns the same list when no elements match', () => {
    expect(toList(removeElements(fromList([1, 2, 3]), 4))).toEqual([1, 2, 3]);
  });
});
