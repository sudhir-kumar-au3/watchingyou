import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { createSortState, randomArray, type SortState } from './types';

const SOURCE = `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
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
    'Starting bubble sort on the array.',
    [1]
  );

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      recorder.countComparison();
      recorder.countAccess(2);
      recorder.capture(
        createSortState([...arr], {
          comparing: [j, j + 1],
          sorted: [...sorted],
          pointers: { i, j },
        }),
        `Compare ${arr[j]} and ${arr[j + 1]}.`,
        [5]
      );

      if (arr[j] > arr[j + 1]) {
        recorder.countSwap();
        recorder.countAccess(2);
        recorder.capture(
          createSortState([...arr], {
            swapping: [j, j + 1],
            sorted: [...sorted],
            pointers: { i, j },
          }),
          `${arr[j]} > ${arr[j + 1]} — swap them.`,
          [6]
        );
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        recorder.capture(
          createSortState([...arr], {
            swapping: [j, j + 1],
            sorted: [...sorted],
            pointers: { i, j },
          }),
          'Swapped.',
          [6]
        );
      }
    }
    sorted.unshift(n - 1 - i);
    recorder.capture(
      createSortState([...arr], { sorted: [...sorted], pointers: { i } }),
      `Largest remaining value bubbled to position ${n - 1 - i}.`,
      [3]
    );
  }

  recorder.capture(
    createSortState(
      [...arr],
      { sorted: arr.map((_, index) => index) }
    ),
    'Array fully sorted.',
    [10]
  );

  return recorder.build();
};

export const bubbleSortModule: AlgorithmModule<SortState, number[]> = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'sorting',
  tagline: 'Adjacent swaps that float the largest values to the top.',
  accent: '#22d3ee',
  sourceCode: SOURCE,
  pythonSource: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
  info: {
    explanation:
      'Bubble sort repeatedly steps through the list, compares adjacent elements, and swaps them when they are out of order. After each full pass the next largest value settles into its final position.',
    complexity: {
      timeBest: 'O(n)',
      timeAverage: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)',
    },
    useCases: [
      'Teaching the mechanics of comparison sorting',
      'Tiny or nearly sorted datasets',
      'Detecting whether a collection is already sorted',
    ],
    realWorld: [
      'Embedded systems with severe memory limits',
      'Introductory computer science instruction',
    ],
  },
  createDefaultInput: () => randomArray(18),
  generate,
};
