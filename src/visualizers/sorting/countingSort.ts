import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { createSortState, randomArray, type SortState } from './types';

const SOURCE = `function countingSort(arr) {
  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);
  for (const v of arr) count[v]++;
  let k = 0;
  for (let v = 0; v <= max; v++) {
    while (count[v]-- > 0) arr[k++] = v;
  }
  return arr;
}`;

const generate = (input: number[]): Timeline<SortState> => {
  const recorder = new TimelineRecorder<SortState>();
  const arr = [...input];
  const max = Math.max(...arr, 0);
  const count = new Array<number>(max + 1).fill(0);

  recorder.capture(createSortState([...arr]), 'Tally how many times each value appears.');

  for (const value of arr) {
    recorder.countComparison();
    recorder.countAccess();
    count[value] += 1;
  }
  recorder.capture(createSortState([...arr]), 'Counts gathered — now write values back in order.');

  const sorted: number[] = [];
  let k = 0;
  for (let value = 0; value <= max; value += 1) {
    while (count[value] > 0) {
      count[value] -= 1;
      arr[k] = value;
      sorted.push(k);
      recorder.countSwap();
      recorder.capture(
        createSortState([...arr], { writing: [k], sorted: [...sorted] }),
        `Place ${value} at index ${k}.`
      );
      k += 1;
    }
  }

  recorder.capture(
    createSortState([...arr], { sorted: arr.map((_, index) => index) }),
    'Array fully sorted.'
  );
  return recorder.build();
};

export const countingSortModule: AlgorithmModule<SortState, number[]> = {
  id: 'counting-sort',
  name: 'Counting Sort',
  category: 'sorting',
  tagline: 'Tally values, then rebuild the array in sorted order.',
  accent: '#2dd4bf',
  sourceCode: SOURCE,
  pythonSource: `def counting_sort(arr):
    if not arr:
        return arr
    hi = max(arr)
    count = [0] * (hi + 1)
    for x in arr:
        count[x] += 1
    out = []
    for value, c in enumerate(count):
        out.extend([value] * c)
    return out`,
  metricLabels: { comparisons: 'Tallies', swaps: 'Placements', accesses: 'Reads' },
  info: {
    explanation:
      'Counting sort is a non-comparison sort for small integer ranges. It counts how many times each value occurs, then writes the values back in ascending order. It runs in linear time when the value range is comparable to the input size.',
    complexity: {
      timeBest: 'O(n + k)',
      timeAverage: 'O(n + k)',
      timeWorst: 'O(n + k)',
      space: 'O(n + k)',
    },
    useCases: [
      'Sorting small-range integers',
      'As the stable subroutine inside radix sort',
      'Histogram and frequency tasks',
    ],
    realWorld: [
      'Bucketing ages, grades, or pixel intensities',
      'Counting phases of radix sort',
    ],
  },
  createDefaultInput: () => randomArray(18),
  generate,
};
