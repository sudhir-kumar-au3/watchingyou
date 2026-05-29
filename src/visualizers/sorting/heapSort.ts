import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { createSortState, randomArray, type SortState } from './types';

const SOURCE = `function heapSort(arr) {
  const n = arr.length;
  for (let i = (n >> 1) - 1; i >= 0; i--) heapify(arr, n, i);
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    heapify(arr, end, 0);
  }
  return arr;
}
function heapify(arr, size, root) {
  let largest = root;
  const l = 2 * root + 1;
  const r = 2 * root + 2;
  if (l < size && arr[l] > arr[largest]) largest = l;
  if (r < size && arr[r] > arr[largest]) largest = r;
  if (largest !== root) {
    [arr[root], arr[largest]] = [arr[largest], arr[root]];
    heapify(arr, size, largest);
  }
}`;

const generate = (input: number[]): Timeline<SortState> => {
  const recorder = new TimelineRecorder<SortState>();
  const arr = [...input];
  const n = arr.length;
  const sorted = new Set<number>();

  const sortedList = (): number[] => [...sorted].sort((a, b) => a - b);

  recorder.capture(
    createSortState([...arr]),
    'Build a max-heap, then extract the root repeatedly.',
    [1]
  );

  const heapify = (size: number, root: number): void => {
    let largest = root;
    const l = 2 * root + 1;
    const r = 2 * root + 2;
    const children = [l, r].filter((c) => c < size);
    recorder.capture(
      createSortState([...arr], {
        pivot: root,
        comparing: children,
        sorted: sortedList(),
        pointers: { root, size },
      }),
      `Sift down from index ${root}.`,
      [14]
    );
    if (l < size) {
      recorder.countComparison();
      recorder.countAccess(2);
      if (arr[l] > arr[largest]) largest = l;
    }
    if (r < size) {
      recorder.countComparison();
      recorder.countAccess(2);
      if (arr[r] > arr[largest]) largest = r;
    }
    if (largest !== root) {
      recorder.countSwap();
      recorder.capture(
        createSortState([...arr], {
          swapping: [root, largest],
          sorted: sortedList(),
          pointers: { root, largest },
        }),
        `Swap ${arr[root]} with larger child ${arr[largest]}.`,
        [17]
      );
      [arr[root], arr[largest]] = [arr[largest], arr[root]];
      heapify(size, largest);
    }
  };

  for (let i = (n >> 1) - 1; i >= 0; i--) heapify(n, i);

  recorder.capture(
    createSortState([...arr], { sorted: sortedList() }),
    'Max-heap built — largest value sits at the root.',
    [3]
  );

  for (let end = n - 1; end > 0; end--) {
    recorder.countSwap();
    recorder.capture(
      createSortState([...arr], {
        swapping: [0, end],
        sorted: sortedList(),
        pointers: { end },
      }),
      `Move current maximum to position ${end}.`,
      [5]
    );
    [arr[0], arr[end]] = [arr[end], arr[0]];
    sorted.add(end);
    heapify(end, 0);
  }
  sorted.add(0);

  recorder.capture(
    createSortState([...arr], { sorted: arr.map((_, index) => index) }),
    'Array fully sorted.',
    [8]
  );

  return recorder.build();
};

export const heapSortModule: AlgorithmModule<SortState, number[]> = {
  id: 'heap-sort',
  name: 'Heap Sort',
  category: 'sorting',
  tagline: 'Build a max-heap, then extract the maximum repeatedly.',
  accent: '#fb923c',
  sourceCode: SOURCE,
  pythonSource: `def heapify(a, n, i):
    largest = i
    l, r = 2 * i + 1, 2 * i + 2
    if l < n and a[l] > a[largest]: largest = l
    if r < n and a[r] > a[largest]: largest = r
    if largest != i:
        a[i], a[largest] = a[largest], a[i]
        heapify(a, n, largest)

def heap_sort(a):
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):
        heapify(a, n, i)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        heapify(a, end, 0)
    return a`,
  info: {
    explanation:
      'Heap sort arranges the array into a binary max-heap so the largest element sits at the root. It swaps that root to the end, shrinks the heap, and sifts the new root down to restore the heap property — repeating until sorted.',
    complexity: {
      timeBest: 'O(n log n)',
      timeAverage: 'O(n log n)',
      timeWorst: 'O(n log n)',
      space: 'O(1)',
    },
    useCases: [
      'Guaranteed O(n log n) with no extra memory',
      'Priority queues and scheduling',
      'Selecting the k largest elements',
    ],
    realWorld: [
      'Operating system task schedulers',
      'Bandwidth and event prioritization queues',
    ],
  },
  createDefaultInput: () => randomArray(18),
  generate,
};
