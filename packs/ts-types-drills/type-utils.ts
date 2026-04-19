// Type-level assertion helpers for ts-types-drills.
// Adapted from type-challenges (https://github.com/type-challenges/type-challenges) — MIT.
//
// This file is the authoritative copy. Each challenge's JSON embeds the same
// contents under `files[].path = "type-utils.ts"` so learners can import from it.

export type Expect<T extends true> = T;

export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;

export type NotEqual<X, Y> = Equal<X, Y> extends true ? false : true;

export type NotAny<T> = [T] extends [never] ? false : 0 extends 1 & T ? false : true;
