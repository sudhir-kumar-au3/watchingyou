import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { randomSortedInput, type SearchInput } from './types';

export interface BinarySearchState {
  array: number[];
  target: number;
  lo: number;
  hi: number;
  mid: number | null;
  foundIndex: number | null;
  done: boolean;
}

export const createBinarySearchState = (
  array: number[],
  target: number,
  partial: Partial<BinarySearchState> = {}
): BinarySearchState => ({
  array,
  target,
  lo: 0,
  hi: array.length - 1,
  mid: null,
  foundIndex: null,
  done: false,
  ...partial,
});

const SOURCE = `function binarySearch(a, target) {
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] === target) return mid;       // hit
    if (a[mid] < target) lo = mid + 1;       // discard left half
    else hi = mid - 1;                       // discard right half
  }
  return -1;                                 // absent
}`;

const generate = (input: SearchInput): Timeline<BinarySearchState> => {
  const recorder = new TimelineRecorder<BinarySearchState>();
  const { array, target } = input;

  const snapshot = (
    description: string,
    partial: Partial<BinarySearchState>
  ): void => {
    recorder.capture(createBinarySearchState(array, target, partial), description);
  };

  let lo = 0;
  let hi = array.length - 1;

  snapshot(`Search the sorted array for ${target}.`, { lo, hi });

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    recorder.countComparison();
    recorder.countAccess();
    snapshot(`Check the middle: index ${mid} holds ${array[mid]}.`, {
      lo,
      hi,
      mid,
    });

    if (array[mid] === target) {
      snapshot(`${array[mid]} === ${target} — found it at index ${mid}.`, {
        lo,
        hi,
        mid,
        foundIndex: mid,
        done: true,
      });
      return recorder.build();
    }

    if (array[mid] < target) {
      snapshot(`${array[mid]} < ${target} — discard the left half.`, {
        lo,
        hi,
        mid,
      });
      lo = mid + 1;
    } else {
      snapshot(`${array[mid]} > ${target} — discard the right half.`, {
        lo,
        hi,
        mid,
      });
      hi = mid - 1;
    }
  }

  snapshot(`Range is empty — ${target} is not in the array.`, {
    lo,
    hi,
    done: true,
  });
  return recorder.build();
};

export const binarySearchModule: AlgorithmModule<BinarySearchState, SearchInput> = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'searching',
  tagline: 'Halve the search range each step to find a value in O(log n).',
  accent: '#22d3ee',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Comparisons',
    swaps: 'Halvings',
    accesses: 'Cells read',
  },
  info: {
    explanation:
      'Binary search works on a sorted array. It compares the target with the middle element and, because the array is ordered, can discard an entire half each step — left if the middle is too big, right if too small. The range shrinks geometrically, so even a million elements take about twenty comparisons.',
    complexity: {
      timeBest: 'O(1)',
      timeAverage: 'O(log n)',
      timeWorst: 'O(log n)',
      space: 'O(1)',
    },
    useCases: [
      'Lookups in a sorted array',
      'First/last occurrence and bound queries',
      'Binary search on the answer (parametric search)',
    ],
    realWorld: [
      'Database B-tree / index probes',
      'Version bisection (git bisect), autocomplete ranges',
    ],
  },
  createDefaultInput: () => randomSortedInput(15),
  generate,
};
