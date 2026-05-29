import { describe, expect, it } from 'vitest';
import { binarySearchModule } from './binarySearch';

const lastState = (array: number[], target: number) => {
  const frames = binarySearchModule.generate({ array, target }).frames;
  return frames[frames.length - 1].state;
};

const sorted = Array.from({ length: 15 }, (_, i) => i * 2 + 1); // 1,3,5,...,29

describe('Binary search', () => {
  it('finds a present target and reports its index', () => {
    const state = lastState(sorted, 17);
    expect(state.done).toBe(true);
    expect(state.foundIndex).not.toBeNull();
    expect(sorted[state.foundIndex as number]).toBe(17);
  });

  it('reports not found for an absent target', () => {
    const state = lastState(sorted, 18);
    expect(state.done).toBe(true);
    expect(state.foundIndex).toBeNull();
  });

  it('uses at most a logarithmic number of comparisons', () => {
    const frames = binarySearchModule.generate({ array: sorted, target: 29 }).frames;
    const comparisons = frames[frames.length - 1].metrics.comparisons;
    expect(comparisons).toBeLessThanOrEqual(Math.ceil(Math.log2(sorted.length)) + 1);
  });
});
