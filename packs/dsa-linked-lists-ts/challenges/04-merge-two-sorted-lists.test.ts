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

const CHALLENGE = join(import.meta.dirname, '04-merge-two-sorted-lists.json');

describe('Merge Two Sorted Lists', () => {
  let mergeTwoLists: (
    list1: ListNode | null,
    list2: ListNode | null,
  ) => ListNode | null;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ mergeTwoLists: typeof mergeTwoLists }>(
      join(tmp.tmpDir, 'solution.ts'),
    );
    mergeTwoLists = mod.mergeTwoLists;
  });

  afterAll(() => cleanup());

  it('merges two sorted lists', () => {
    const l1 = fromList([1, 2, 4]);
    const l2 = fromList([1, 3, 4]);
    expect(toList(mergeTwoLists(l1, l2))).toEqual([1, 1, 2, 3, 4, 4]);
  });

  it('returns null when both lists are empty', () => {
    expect(mergeTwoLists(null, null)).toBeNull();
  });

  it('returns the non-empty list when one is empty', () => {
    const l2 = fromList([0]);
    expect(toList(mergeTwoLists(null, l2))).toEqual([0]);
  });

  it('merges lists of different lengths', () => {
    const l1 = fromList([1, 3, 5, 7]);
    const l2 = fromList([2, 4]);
    expect(toList(mergeTwoLists(l1, l2))).toEqual([1, 2, 3, 4, 5, 7]);
  });

  it('merges lists with all duplicate values', () => {
    const l1 = fromList([1, 1, 1]);
    const l2 = fromList([1, 1, 1]);
    expect(toList(mergeTwoLists(l1, l2))).toEqual([1, 1, 1, 1, 1, 1]);
  });
});
