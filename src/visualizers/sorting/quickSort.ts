import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { createSortState, randomArray, type SortState } from './types';

const SOURCE = `function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  quickSort(arr, lo, i - 1);
  quickSort(arr, i + 1, hi);
  return arr;
}`;

const generate = (input: number[]): Timeline<SortState> => {
  const recorder = new TimelineRecorder<SortState>();
  const arr = [...input];
  const sorted = new Set<number>();

  recorder.capture(
    createSortState([...arr]),
    'Starting quick sort with Lomuto partitioning.',
    [1]
  );

  const capture = (
    description: string,
    lines: number[],
    partial: Partial<SortState>
  ): void => {
    recorder.capture(
      createSortState([...arr], {
        sorted: [...sorted].sort((a, b) => a - b),
        ...partial,
      }),
      description,
      lines
    );
  };

  const partition = (lo: number, hi: number): number => {
    const pivotValue = arr[hi];
    capture(`Choose pivot ${pivotValue} at index ${hi}.`, [3], {
      pivot: hi,
      range: [lo, hi],
      pointers: { lo, hi },
    });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      recorder.countComparison();
      recorder.countAccess(2);
      capture(`Compare ${arr[j]} with pivot ${pivotValue}.`, [6], {
        pivot: hi,
        range: [lo, hi],
        comparing: [j, hi],
        pointers: { i, j, lo, hi },
      });
      if (arr[j] < pivotValue) {
        recorder.countSwap();
        recorder.countAccess(2);
        capture(`${arr[j]} < pivot — move into the smaller partition.`, [7], {
          pivot: hi,
          range: [lo, hi],
          swapping: [i, j],
          pointers: { i, j, lo, hi },
        });
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
      }
    }
    recorder.countSwap();
    capture('Place pivot at its sorted position.', [11], {
      range: [lo, hi],
      swapping: [i, hi],
      pointers: { i, lo, hi },
    });
    [arr[i], arr[hi]] = [arr[hi], arr[i]];
    sorted.add(i);
    capture(`Pivot settled at index ${i}.`, [11], { pointers: { i } });
    return i;
  };

  const sort = (lo: number, hi: number): void => {
    if (lo >= hi) {
      if (lo === hi) sorted.add(lo);
      return;
    }
    const p = partition(lo, hi);
    sort(lo, p - 1);
    sort(p + 1, hi);
  };

  sort(0, arr.length - 1);

  recorder.capture(
    createSortState([...arr], { sorted: arr.map((_, index) => index) }),
    'Array fully sorted.',
    [16]
  );

  return recorder.build();
};

export const quickSortModule: AlgorithmModule<SortState, number[]> = {
  id: 'quick-sort',
  name: 'Quick Sort',
  category: 'sorting',
  tagline: 'Divide and conquer around a pivot for near-linear speed.',
  accent: '#a855f7',
  sourceCode: SOURCE,
  pythonSource: `def quicksort(arr, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1
    if lo >= hi:
        return arr
    pivot = arr[hi]
    i = lo
    for j in range(lo, hi):
        if arr[j] < pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[hi] = arr[hi], arr[i]
    quicksort(arr, lo, i - 1)
    quicksort(arr, i + 1, hi)
    return arr`,
  info: {
    explanation:
      'Quick sort selects a pivot and partitions the array so that smaller values sit to its left and larger values to its right. It then recursively sorts each partition. The pivot lands in its final position after every partition step.',
    complexity: {
      timeBest: 'O(n log n)',
      timeAverage: 'O(n log n)',
      timeWorst: 'O(n²)',
      space: 'O(log n)',
    },
    useCases: [
      'General-purpose in-memory sorting',
      'Systems where average-case speed matters most',
      'Datasets that fit comfortably in memory',
    ],
    realWorld: [
      'Language standard library sort implementations',
      'Database query engines ordering result sets',
    ],
  },
  createDefaultInput: () => randomArray(18),
  generate,
};
