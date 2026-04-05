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

const CHALLENGE = join(import.meta.dirname, '06-remove-duplicates-sorted.json');

describe('Remove Duplicates from Sorted List', () => {
  let deleteDuplicates: (head: ListNode | null) => ListNode | null;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ deleteDuplicates: typeof deleteDuplicates }>(
      join(tmp.tmpDir, 'solution.ts'),
    );
    deleteDuplicates = mod.deleteDuplicates;
  });

  afterAll(() => cleanup());

  it('removes duplicates from a basic list', () => {
    expect(toList(deleteDuplicates(fromList([1, 1, 2])))).toEqual([1, 2]);
  });

  it('removes multiple groups of duplicates', () => {
    expect(toList(deleteDuplicates(fromList([1, 1, 2, 3, 3])))).toEqual([1, 2, 3]);
  });

  it('returns null for an empty list', () => {
    expect(deleteDuplicates(null)).toBeNull();
  });

  it('returns the same list when there are no duplicates', () => {
    expect(toList(deleteDuplicates(fromList([1, 2, 3])))).toEqual([1, 2, 3]);
  });

  it('reduces all-same list to a single node', () => {
    expect(toList(deleteDuplicates(fromList([1, 1, 1, 1])))).toEqual([1]);
  });

  it('returns a single-element list unchanged', () => {
    expect(toList(deleteDuplicates(fromList([1])))).toEqual([1]);
  });
});
