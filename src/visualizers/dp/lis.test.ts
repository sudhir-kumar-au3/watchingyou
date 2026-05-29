import { describe, expect, it } from 'vitest';
import { lisModule } from './lis';

const lisLength = (array: number[]): number => {
  const frames = lisModule.generate(array).frames;
  const grid = frames[frames.length - 1].state.grid;
  return Math.max(...grid[0].map((cell) => cell ?? 0));
};

describe('Longest Increasing Subsequence', () => {
  it('finds the classic length-4 result', () => {
    expect(lisLength([10, 9, 2, 5, 3, 7, 101, 18])).toBe(4);
  });

  it('returns n for a strictly increasing array', () => {
    expect(lisLength([1, 2, 3, 4, 5])).toBe(5);
  });

  it('returns 1 for a strictly decreasing array', () => {
    expect(lisLength([5, 4, 3, 2, 1])).toBe(1);
  });

  it('marks an increasing path of the LIS length', () => {
    const frames = lisModule.generate([10, 9, 2, 5, 3, 7, 101, 18]).frames;
    expect(frames[frames.length - 1].state.path.length).toBe(4);
  });
});
