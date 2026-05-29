import { describe, expect, it } from 'vitest';
import { subsetSumModule, type SubsetInput } from './subsetSum';

const reachable = (input: SubsetInput): boolean => {
  const frames = subsetSumModule.generate(input).frames;
  const grid = frames[frames.length - 1].state.grid;
  return grid[input.values.length][input.target] === 1;
};

describe('Subset sum', () => {
  it('finds a subset that hits the target', () => {
    expect(reachable({ values: [3, 4, 5, 2], target: 9 })).toBe(true);
  });

  it('reports an impossible target', () => {
    expect(reachable({ values: [2, 4], target: 7 })).toBe(false);
  });

  it('always reaches a target of zero (empty subset)', () => {
    expect(reachable({ values: [3, 4], target: 0 })).toBe(true);
  });
});
