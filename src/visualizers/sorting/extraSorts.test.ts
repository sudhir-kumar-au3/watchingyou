import { describe, expect, it } from 'vitest';
import { radixSortModule } from './radixSort';
import { countingSortModule } from './countingSort';
import type { AlgorithmModule } from '@/core/engine/types';
import type { SortState } from './types';

const sortedResult = (
  module: AlgorithmModule<SortState, number[]>,
  input: number[]
): number[] => {
  const frames = module.generate(input).frames;
  return frames[frames.length - 1].state.array;
};

const cases: [string, number[]][] = [
  ['random', [37, 12, 5, 88, 41, 7, 63, 21]],
  ['with duplicates', [5, 3, 5, 1, 3, 1, 9]],
  ['already sorted', [1, 2, 3, 4, 5]],
  ['single', [42]],
];

describe('Counting sort', () => {
  it.each(cases)('sorts a %s array', (_label, input) => {
    expect(sortedResult(countingSortModule, input)).toEqual(
      [...input].sort((a, b) => a - b)
    );
  });
});

describe('Radix sort', () => {
  it.each(cases)('sorts a %s array', (_label, input) => {
    expect(sortedResult(radixSortModule, input)).toEqual(
      [...input].sort((a, b) => a - b)
    );
  });
});
