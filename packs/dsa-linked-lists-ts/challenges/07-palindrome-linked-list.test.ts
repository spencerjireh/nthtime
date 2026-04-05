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

const CHALLENGE = join(import.meta.dirname, '07-palindrome-linked-list.json');

describe('Palindrome Linked List', () => {
  let isPalindrome: (head: ListNode | null) => boolean;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ isPalindrome: typeof isPalindrome }>(
      join(tmp.tmpDir, 'solution.ts'),
    );
    isPalindrome = mod.isPalindrome;
  });

  afterAll(() => cleanup());

  it('detects an even-length palindrome', () => {
    expect(isPalindrome(fromList([1, 2, 2, 1]))).toBe(true);
  });

  it('detects a non-palindrome', () => {
    expect(isPalindrome(fromList([1, 2]))).toBe(false);
  });

  it('returns true for a single element', () => {
    expect(isPalindrome(fromList([1]))).toBe(true);
  });

  it('detects an odd-length palindrome', () => {
    expect(isPalindrome(fromList([1, 2, 3, 2, 1]))).toBe(true);
  });

  it('detects a longer non-palindrome', () => {
    expect(isPalindrome(fromList([1, 2, 3, 4]))).toBe(false);
  });

  it('returns true for an empty list', () => {
    expect(isPalindrome(null)).toBe(true);
  });

  it('detects a two-element palindrome', () => {
    expect(isPalindrome(fromList([1, 1]))).toBe(true);
  });
});
