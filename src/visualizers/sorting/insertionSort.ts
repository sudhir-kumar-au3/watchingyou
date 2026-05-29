import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { createSortState, randomArray, type SortState } from './types';

const SOURCE = `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`;

const generate = (input: number[]): Timeline<SortState> => {
  const recorder = new TimelineRecorder<SortState>();
  const arr = [...input];
  const n = arr.length;

  recorder.capture(
    createSortState([...arr], { sorted: [0] }),
    'Treat the first element as a sorted region of one.',
    [1]
  );

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    recorder.countAccess();
    recorder.capture(
      createSortState([...arr], {
        comparing: [i],
        sorted: Array.from({ length: i }, (_, k) => k),
        pointers: { i, key },
      }),
      `Insert ${key} into the sorted region.`,
      [3]
    );

    while (j >= 0 && arr[j] > key) {
      recorder.countComparison();
      recorder.countAccess();
      recorder.countSwap();
      arr[j + 1] = arr[j];
      recorder.capture(
        createSortState([...arr], {
          writing: [j + 1],
          comparing: [j],
          sorted: Array.from({ length: i }, (_, k) => k),
          pointers: { i, j, key },
        }),
        `${arr[j]} > ${key} — shift it right.`,
        [6]
      );
      j--;
    }

    arr[j + 1] = key;
    recorder.capture(
      createSortState([...arr], {
        writing: [j + 1],
        sorted: Array.from({ length: i + 1 }, (_, k) => k),
        pointers: { i, key },
      }),
      `Drop ${key} into position ${j + 1}.`,
      [9]
    );
  }

  recorder.capture(
    createSortState([...arr], { sorted: arr.map((_, index) => index) }),
    'Array fully sorted.',
    [11]
  );

  return recorder.build();
};

export const insertionSortModule: AlgorithmModule<SortState, number[]> = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  tagline: 'Build a sorted region one element at a time.',
  accent: '#34d399',
  sourceCode: SOURCE,
  pythonSource: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
  info: {
    explanation:
      'Insertion sort grows a sorted region at the front of the array. Each new element is compared backward and shifted into the correct slot, much like sorting a hand of playing cards.',
    complexity: {
      timeBest: 'O(n)',
      timeAverage: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)',
    },
    useCases: [
      'Small or nearly sorted datasets',
      'Online sorting as data streams in',
      'The base case inside hybrid sorts like Tim Sort',
    ],
    realWorld: [
      'Sorting small partitions inside production sort routines',
      'Keeping a live leaderboard ordered as scores arrive',
    ],
  },
  createDefaultInput: () => randomArray(18),
  generate,
};
