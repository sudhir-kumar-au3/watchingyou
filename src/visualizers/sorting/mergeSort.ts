import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { createSortState, randomArray, type SortState } from './types';

const SOURCE = `function mergeSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;
  const mid = (lo + hi) >> 1;
  mergeSort(arr, lo, mid);
  mergeSort(arr, mid + 1, hi);
  const left = arr.slice(lo, mid + 1);
  const right = arr.slice(mid + 1, hi + 1);
  let i = 0, j = 0, k = lo;
  while (i < left.length && j < right.length) {
    arr[k++] = left[i] <= right[j] ? left[i++] : right[j++];
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
  return arr;
}`;

const generate = (input: number[]): Timeline<SortState> => {
  const recorder = new TimelineRecorder<SortState>();
  const arr = [...input];

  recorder.capture(
    createSortState([...arr]),
    'Recursively split, then merge sorted halves.',
    [1]
  );

  const place = (k: number, lo: number, hi: number, value: number): void => {
    arr[k] = value;
    recorder.countAccess();
    recorder.capture(
      createSortState([...arr], {
        range: [lo, hi],
        writing: [k],
        pointers: { lo, hi, k },
      }),
      `Write ${value} into position ${k}.`,
      [10]
    );
  };

  const merge = (lo: number, mid: number, hi: number): void => {
    const left = arr.slice(lo, mid + 1);
    const right = arr.slice(mid + 1, hi + 1);
    recorder.capture(
      createSortState([...arr], { range: [lo, hi], pointers: { lo, mid, hi } }),
      `Merge [${lo}…${mid}] with [${mid + 1}…${hi}].`,
      [6]
    );

    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      recorder.countComparison();
      recorder.countAccess(2);
      if (left[i] <= right[j]) {
        place(k, lo, hi, left[i]);
        i += 1;
      } else {
        place(k, lo, hi, right[j]);
        j += 1;
      }
      k += 1;
    }
    while (i < left.length) {
      place(k, lo, hi, left[i]);
      i += 1;
      k += 1;
    }
    while (j < right.length) {
      place(k, lo, hi, right[j]);
      j += 1;
      k += 1;
    }
  };

  const sort = (lo: number, hi: number): void => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  };

  sort(0, arr.length - 1);

  recorder.capture(
    createSortState([...arr], { sorted: arr.map((_, index) => index) }),
    'Array fully sorted.',
    [14]
  );

  return recorder.build();
};

export const mergeSortModule: AlgorithmModule<SortState, number[]> = {
  id: 'merge-sort',
  name: 'Merge Sort',
  category: 'sorting',
  tagline: 'Divide into halves, then merge them back in order.',
  accent: '#60a5fa',
  sourceCode: SOURCE,
  pythonSource: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]`,
  info: {
    explanation:
      'Merge sort splits the array down to single elements, then repeatedly merges adjacent sorted runs into larger sorted runs. It guarantees O(n log n) time and is stable, at the cost of linear auxiliary space.',
    complexity: {
      timeBest: 'O(n log n)',
      timeAverage: 'O(n log n)',
      timeWorst: 'O(n log n)',
      space: 'O(n)',
    },
    useCases: [
      'Stable sorting where equal keys must keep their order',
      'External sorting of data too large for memory',
      'Linked lists, which merge without random access',
    ],
    realWorld: [
      'Merging sorted log streams in distributed systems',
      'The merge phase of external database sorts',
    ],
  },
  createDefaultInput: () => randomArray(18),
  generate,
};
