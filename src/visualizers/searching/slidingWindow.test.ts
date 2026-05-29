import { describe, expect, it } from 'vitest';
import { slidingWindowModule } from './slidingWindow';

const finalState = (array: number[], target: number) => {
  const frames = slidingWindowModule.generate({ array, target }).frames;
  return frames[frames.length - 1].state;
};

describe('Sliding window — smallest subarray with sum ≥ target', () => {
  it('finds the shortest qualifying window length', () => {
    const state = finalState([2, 3, 1, 2, 4, 3], 7);
    expect(state.phase).toBe('done');
    expect(state.best).toBe(2);
  });

  it('returns 0 when no subarray reaches the target', () => {
    const state = finalState([1, 1, 1], 100);
    expect(state.best).toBe(0);
    expect(state.bestRange).toBeNull();
  });

  it('handles the whole array being the answer', () => {
    const state = finalState([1, 2, 3, 4], 10);
    expect(state.best).toBe(4);
  });

  it('reports a best range whose values sum to at least the target', () => {
    const array = [2, 3, 1, 2, 4, 3];
    const state = finalState(array, 7);
    expect(state.bestRange).not.toBeNull();
    const [lo, hi] = state.bestRange as [number, number];
    const sum = array.slice(lo, hi + 1).reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThanOrEqual(7);
    expect(hi - lo + 1).toBe(state.best);
  });
});
