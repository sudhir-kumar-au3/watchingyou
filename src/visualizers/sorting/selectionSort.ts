import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { createSortState, randomArray, type SortState } from './types';

const SOURCE = `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[min]) min = j;
    }
    [arr[i], arr[min]] = [arr[min], arr[i]];
  }
  return arr;
}`;

const generate = (input: number[]): Timeline<SortState> => {
  const recorder = new TimelineRecorder<SortState>();
  const arr = [...input];
  const n = arr.length;
  const sorted: number[] = [];

  recorder.capture(
    createSortState([...arr]),
    'Find the smallest value and place it first.',
    [1]
  );

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    recorder.capture(
      createSortState([...arr], {
        pivot: min,
        sorted: [...sorted],
        pointers: { i, min },
      }),
      `Assume index ${i} holds the minimum.`,
      [4]
    );

    for (let j = i + 1; j < n; j++) {
      recorder.countComparison();
      recorder.countAccess(2);
      recorder.capture(
        createSortState([...arr], {
          pivot: min,
          comparing: [j],
          sorted: [...sorted],
          pointers: { i, j, min },
        }),
        `Compare ${arr[j]} against current minimum ${arr[min]}.`,
        [6]
      );
      if (arr[j] < arr[min]) {
        min = j;
        recorder.capture(
          createSortState([...arr], {
            pivot: min,
            sorted: [...sorted],
            pointers: { i, j, min },
          }),
          `New minimum: ${arr[min]} at index ${min}.`,
          [6]
        );
      }
    }

    if (min !== i) {
      recorder.countSwap();
      recorder.capture(
        createSortState([...arr], {
          swapping: [i, min],
          sorted: [...sorted],
          pointers: { i, min },
        }),
        `Swap minimum into position ${i}.`,
        [8]
      );
      [arr[i], arr[min]] = [arr[min], arr[i]];
    }
    sorted.push(i);
    recorder.capture(
      createSortState([...arr], { sorted: [...sorted], pointers: { i } }),
      `Position ${i} finalized.`,
      [3]
    );
  }

  recorder.capture(
    createSortState([...arr], { sorted: arr.map((_, index) => index) }),
    'Array fully sorted.',
    [10]
  );

  return recorder.build();
};

export const selectionSortModule: AlgorithmModule<SortState, number[]> = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'sorting',
  tagline: 'Repeatedly select the minimum and lock it in place.',
  accent: '#f472b6',
  sourceCode: SOURCE,
  pythonSource: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        m = i
        for j in range(i + 1, n):
            if arr[j] < arr[m]:
                m = j
        arr[i], arr[m] = arr[m], arr[i]
    return arr`,
  info: {
    explanation:
      'Selection sort scans the unsorted region for its smallest element and swaps it to the boundary of the sorted region. It performs the fewest swaps of the elementary sorts, at the cost of always scanning the full remainder.',
    complexity: {
      timeBest: 'O(n²)',
      timeAverage: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)',
    },
    useCases: [
      'When writes are far more expensive than reads',
      'Small datasets where simplicity matters',
      'Teaching selection-based sorting',
    ],
    realWorld: [
      'Flash memory systems where each write wears the medium',
      'Selecting top-k elements in a partial pass',
    ],
  },
  createDefaultInput: () => randomArray(18),
  generate,
};
