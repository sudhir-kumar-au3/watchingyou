import { describe, expect, it } from 'vitest';
import { arraysEqual } from './CodePanel';

describe('arraysEqual', () => {
  it('returns true for the same reference', () => {
    const a = [1, 2, 3];
    expect(arraysEqual(a, a)).toBe(true);
  });

  it('returns true for arrays with identical contents', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it('returns true for two empty arrays', () => {
    expect(arraysEqual([], [])).toBe(true);
  });

  it('returns false when lengths differ', () => {
    expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it('returns false when any element differs', () => {
    expect(arraysEqual([1, 2, 3], [1, 9, 3])).toBe(false);
  });

  it('respects element order', () => {
    expect(arraysEqual([1, 2, 3], [3, 2, 1])).toBe(false);
  });
});
