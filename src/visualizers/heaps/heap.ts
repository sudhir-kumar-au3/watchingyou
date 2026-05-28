import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { createHeapState, randomHeapValues, type HeapState } from './types';

const SOURCE = `function siftDown(a, i, size) {
  while (true) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size && a[l] > a[largest]) largest = l;
    if (r < size && a[r] > a[largest]) largest = r;
    if (largest === i) break;
    [a[i], a[largest]] = [a[largest], a[i]];
    i = largest;
  }
}

function heapSort(a) {
  const n = a.length;
  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(a, i, n);
  for (let end = n - 1; end >= 1; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    siftDown(a, 0, end);
  }
  return a;
}`;

const generate = (input: number[]): Timeline<HeapState> => {
  const recorder = new TimelineRecorder<HeapState>();
  const values = [...input];
  const n = values.length;
  let size = n;

  const snapshot = (description: string, partial: Partial<HeapState>): void => {
    recorder.capture(createHeapState(values, size, partial), description);
  };

  const siftDown = (start: number, limit: number): void => {
    let i = start;
    for (;;) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      const children: number[] = [];
      if (left < limit) children.push(left);
      if (right < limit) children.push(right);
      if (children.length === 0) break;

      recorder.countComparison(children.length);
      recorder.countAccess(children.length + 1);
      snapshot(
        `Compare ${values[i]} with child${children.length > 1 ? 'ren' : ''} ${children
          .map((c) => values[c])
          .join(', ')}.`,
        { active: i, comparing: children }
      );

      let largest = i;
      for (const child of children) {
        if (values[child] > values[largest]) largest = child;
      }

      if (largest === i) {
        snapshot(`${values[i]} already dominates its children — settled.`, {
          active: i,
        });
        break;
      }

      snapshot(`${values[largest]} is larger — swap it upward.`, {
        active: i,
        comparing: [largest],
      });
      [values[i], values[largest]] = [values[largest], values[i]];
      recorder.countSwap();
      snapshot(`Swapped — keep sifting down from index ${largest}.`, {
        swapped: [i, largest],
      });
      i = largest;
    }
  };

  snapshot('Read the flat array as a complete binary tree.', {});

  for (let i = (n >> 1) - 1; i >= 0; i -= 1) {
    snapshot(`Heapify the subtree rooted at index ${i} (value ${values[i]}).`, {
      active: i,
    });
    siftDown(i, n);
  }

  snapshot('Max-heap built — the largest value sits at the root.', { active: 0 });

  for (let end = n - 1; end >= 1; end -= 1) {
    [values[0], values[end]] = [values[end], values[0]];
    recorder.countSwap();
    size = end;
    snapshot(`Move max ${values[end]} to position ${end} — now locked in place.`, {
      swapped: [0, end],
    });
    siftDown(0, size);
  }

  size = 0;
  snapshot('Heap-sort complete — the array is sorted ascending.', {});

  return recorder.build();
};

export const heapModule: AlgorithmModule<HeapState, number[]> = {
  id: 'binary-heap',
  name: 'Binary Heap',
  category: 'tree',
  tagline: 'Build a max-heap in an array, then heap-sort by extracting the root.',
  accent: '#fb7185',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Comparisons',
    swaps: 'Swaps',
    accesses: 'Array reads',
  },
  info: {
    explanation:
      'A binary heap is a complete binary tree stored in a flat array: the children of index i live at 2i+1 and 2i+2. A max-heap keeps every parent ≥ its children. Floyd’s build-heap sifts each internal node down in O(n); heap-sort then repeatedly swaps the root to the end and re-sifts, sorting in place with no extra memory.',
    complexity: {
      timeBest: 'O(n log n)',
      timeAverage: 'O(n log n)',
      timeWorst: 'O(n log n)',
      space: 'O(1)',
    },
    useCases: [
      'Priority queues (push / pop-max)',
      'In-place sorting with guaranteed bounds',
      'Selecting the top-k elements of a stream',
    ],
    realWorld: [
      'OS schedulers and event-driven simulations',
      'Dijkstra / Prim priority queues',
    ],
  },
  createDefaultInput: () => randomHeapValues(7),
  generate,
};
