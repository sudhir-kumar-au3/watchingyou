import { describe, expect, it } from 'vitest';
import { lcsModule } from './lcs';
import { editDistanceModule } from './editDistance';
import { knapsackModule } from './knapsack';

const finalCell = (grid: (number | null)[][]): number | null => {
  const lastRow = grid[grid.length - 1];
  return lastRow[lastRow.length - 1];
};

const lastState = <T>(
  module: { generate: (input: T) => { frames: { state: { grid: (number | null)[][] } }[] } },
  input: T
) => {
  const frames = module.generate(input).frames;
  return frames[frames.length - 1].state;
};

describe('LCS', () => {
  it('computes the longest common subsequence length', () => {
    const state = lastState(lcsModule, { a: 'ABCBDAB', b: 'BDCAB' });
    expect(finalCell(state.grid)).toBe(4);
  });

  it('handles no common subsequence', () => {
    const state = lastState(lcsModule, { a: 'ABC', b: 'XYZ' });
    expect(finalCell(state.grid)).toBe(0);
  });
});

describe('Edit distance', () => {
  it('computes Levenshtein distance', () => {
    const state = lastState(editDistanceModule, { a: 'kitten', b: 'sitting' });
    expect(finalCell(state.grid)).toBe(3);
  });

  it('is zero for identical strings', () => {
    const state = lastState(editDistanceModule, { a: 'same', b: 'same' });
    expect(finalCell(state.grid)).toBe(0);
  });
});

describe('0/1 Knapsack', () => {
  it('maximises value within capacity', () => {
    const state = lastState(knapsackModule, {
      weights: [1, 3, 4, 5],
      values: [1, 4, 5, 7],
      capacity: 7,
    });
    expect(finalCell(state.grid)).toBe(9);
  });
});
