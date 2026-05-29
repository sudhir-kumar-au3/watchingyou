import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { randomWindowInput, type SearchInput } from './types';

export interface WindowState {
  array: number[];
  target: number;
  left: number;
  right: number;
  sum: number;
  best: number;
  bestRange: [number, number] | null;
  phase: 'expand' | 'contract' | 'done';
}

export const createWindowState = (
  array: number[],
  target: number,
  partial: Partial<WindowState> = {}
): WindowState => ({
  array,
  target,
  left: 0,
  right: -1,
  sum: 0,
  best: 0,
  bestRange: null,
  phase: 'expand',
  ...partial,
});

const SOURCE = `function shortestSubarray(a, target) {
  let left = 0, sum = 0, best = Infinity;
  for (let right = 0; right < a.length; right++) {
    sum += a[right];                 // expand the window
    while (sum >= target) {          // window qualifies — try to shrink
      best = Math.min(best, right - left + 1);
      sum -= a[left++];              // contract from the left
    }
  }
  return best === Infinity ? 0 : best;
}`;

const finiteBest = (value: number): number =>
  Number.isFinite(value) ? value : 0;

const generate = (input: SearchInput): Timeline<WindowState> => {
  const recorder = new TimelineRecorder<WindowState>();
  const { array, target } = input;
  const n = array.length;

  let left = 0;
  let sum = 0;
  let minLen = Infinity;
  let bestRange: [number, number] | null = null;

  const snapshot = (
    description: string,
    partial: Partial<WindowState>
  ): void => {
    recorder.capture(createWindowState(array, target, partial), description);
  };

  snapshot(`Find the shortest run of values summing to at least ${target}.`, {
    left: 0,
    right: -1,
    sum: 0,
    phase: 'expand',
  });

  for (let right = 0; right < n; right += 1) {
    sum += array[right];
    recorder.countAccess();
    snapshot(`Expand to index ${right}: add ${array[right]} → window sum ${sum}.`, {
      left,
      right,
      sum,
      best: finiteBest(minLen),
      bestRange,
      phase: 'expand',
    });

    while (sum >= target) {
      recorder.countComparison();
      const length = right - left + 1;
      if (length < minLen) {
        minLen = length;
        bestRange = [left, right];
        snapshot(
          `Sum ${sum} ≥ ${target}: window [${left}, ${right}] is the shortest yet (${length}).`,
          { left, right, sum, best: length, bestRange, phase: 'contract' }
        );
      }
      sum -= array[left];
      left += 1;
      recorder.countSwap();
      snapshot(`Shrink from the left (drop index ${left - 1}) → window sum ${sum}.`, {
        left,
        right,
        sum,
        best: finiteBest(minLen),
        bestRange,
        phase: 'contract',
      });
    }
  }

  const best = finiteBest(minLen);
  snapshot(
    best > 0
      ? `Shortest subarray summing to ≥ ${target} has length ${best}.`
      : `No subarray reaches ${target}.`,
    { left, right: n - 1, sum, best, bestRange, phase: 'done' }
  );

  return recorder.build();
};

export const slidingWindowModule: AlgorithmModule<WindowState, SearchInput> = {
  id: 'sliding-window',
  name: 'Sliding Window',
  category: 'searching',
  tagline: 'Two pointers grow and shrink a window — find the shortest run in O(n).',
  accent: '#a3e635',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Target checks',
    swaps: 'Left shrinks',
    accesses: 'Right expansions',
  },
  info: {
    explanation:
      'The sliding-window / two-pointer pattern keeps a contiguous window and moves two indices instead of re-scanning. Here we find the shortest subarray whose sum reaches a target: the right pointer expands the window adding elements, and whenever the sum qualifies, the left pointer contracts it to look for an even shorter one. Each index enters and leaves the window once, so the whole scan is O(n) instead of O(n²).',
    complexity: {
      timeBest: 'O(n)',
      timeAverage: 'O(n)',
      timeWorst: 'O(n)',
      space: 'O(1)',
    },
    useCases: [
      'Subarray/substring with a sum or length constraint',
      'Longest substring without repeating characters',
      'Rate limiting and moving averages over a stream',
    ],
    realWorld: [
      'Network throughput windows',
      'Streaming analytics and anomaly detection',
    ],
  },
  createDefaultInput: () => randomWindowInput(12),
  generate,
};
