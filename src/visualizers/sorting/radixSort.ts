import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { createSortState, randomArray, type SortState } from './types';

const SOURCE = `function radixSort(arr) {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const output = new Array(arr.length);
    const count = new Array(10).fill(0);
    for (const v of arr) count[Math.floor(v / exp) % 10]++;
    for (let d = 1; d < 10; d++) count[d] += count[d - 1];
    for (let i = arr.length - 1; i >= 0; i--) {
      const d = Math.floor(arr[i] / exp) % 10;
      output[--count[d]] = arr[i];
    }
    for (let i = 0; i < arr.length; i++) arr[i] = output[i];
  }
  return arr;
}`;

const generate = (input: number[]): Timeline<SortState> => {
  const recorder = new TimelineRecorder<SortState>();
  const arr = [...input];
  const n = arr.length;
  const max = Math.max(...arr, 0);

  recorder.capture(createSortState([...arr]), 'Sort by each digit, least significant first.');

  let place = 1;
  let digitIndex = 1;
  while (Math.floor(max / place) > 0) {
    const output = new Array<number>(n);
    const count = new Array<number>(10).fill(0);
    for (const value of arr) {
      recorder.countAccess();
      count[Math.floor(value / place) % 10] += 1;
    }
    for (let d = 1; d < 10; d += 1) count[d] += count[d - 1];
    for (let i = n - 1; i >= 0; i -= 1) {
      const digit = Math.floor(arr[i] / place) % 10;
      count[digit] -= 1;
      output[count[digit]] = arr[i];
    }
    for (let i = 0; i < n; i += 1) {
      arr[i] = output[i];
      recorder.countSwap();
      recorder.capture(
        createSortState([...arr], { writing: [i] }),
        `Pass ${digitIndex}: stable-sort by digit ${digitIndex} → index ${i}.`
      );
    }
    recorder.capture(
      createSortState([...arr]),
      `After pass ${digitIndex}, array is sorted by its ${digitIndex === 1 ? 'last' : `${digitIndex}th-from-last`} digit.`
    );
    place *= 10;
    digitIndex += 1;
  }

  recorder.capture(
    createSortState([...arr], { sorted: arr.map((_, index) => index) }),
    'Array fully sorted.'
  );
  return recorder.build();
};

export const radixSortModule: AlgorithmModule<SortState, number[]> = {
  id: 'radix-sort',
  name: 'Radix Sort',
  category: 'sorting',
  tagline: 'Stable-sort digit by digit, least significant first.',
  accent: '#818cf8',
  sourceCode: SOURCE,
  metricLabels: { comparisons: 'Tallies', swaps: 'Placements', accesses: 'Reads' },
  info: {
    explanation:
      'Radix sort orders integers by processing their digits from least to most significant, using a stable counting sort on each digit. Because each pass preserves the order of previous passes, the array ends fully sorted without ever comparing two elements directly.',
    complexity: {
      timeBest: 'O(d·(n + k))',
      timeAverage: 'O(d·(n + k))',
      timeWorst: 'O(d·(n + k))',
      space: 'O(n + k)',
    },
    useCases: [
      'Sorting fixed-width integers or strings',
      'Large datasets where comparisons are costly',
      'Stable ordering by multiple keys',
    ],
    realWorld: [
      'Sorting large numeric IDs and timestamps',
      'Bucketing in distributed data pipelines',
    ],
  },
  createDefaultInput: () => randomArray(18),
  generate,
};
