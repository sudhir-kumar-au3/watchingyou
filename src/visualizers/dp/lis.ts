import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { createDpState, type DpState } from './types';

const SOURCE = `function lis(a) {
  const dp = a.map(() => 1);                 // each element alone
  for (let i = 1; i < a.length; i++)
    for (let j = 0; j < i; j++)
      if (a[j] < a[i] && dp[j] + 1 > dp[i])
        dp[i] = dp[j] + 1;                    // extend the run ending at j
  return Math.max(...dp);
}`;

export const randomLisInput = (size = 8): number[] =>
  Array.from({ length: size }, () => Math.floor(Math.random() * 30) + 1);

const generate = (input: number[]): Timeline<DpState> => {
  const a = input.slice(0, 12);
  const n = a.length;
  const dp = new Array<number>(n).fill(1);
  const prev = new Array<number>(n).fill(-1);
  const grid: (number | null)[][] = [new Array<number | null>(n).fill(null)];
  const colHeader = a.map(String);
  const recorder = new TimelineRecorder<DpState>();

  const snapshot = (description: string, partial: Partial<DpState>): void => {
    recorder.capture(
      createDpState({
        grid: [[...grid[0]]],
        rowHeader: ['LIS'],
        colHeader,
        rowTitle: '',
        colTitle: 'array',
        ...partial,
      }),
      description
    );
  };

  snapshot('Each element alone is an increasing run of length 1.', {});

  for (let i = 0; i < n; i += 1) {
    const deps: [number, number][] = [];
    for (let j = 0; j < i; j += 1) {
      recorder.countComparison();
      if (a[j] < a[i]) {
        deps.push([0, j]);
        if (dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;
          prev[i] = j;
          recorder.countSwap();
        }
      }
    }
    grid[0][i] = dp[i];
    snapshot(
      `dp[${i}] (value ${a[i]}) = longest increasing run ending here = ${dp[i]}.`,
      { current: [0, i], dependencies: deps }
    );
  }

  let best = 0;
  for (let i = 1; i < n; i += 1) if (dp[i] > dp[best]) best = i;
  const path: [number, number][] = [];
  for (let k = best; k !== -1; k = prev[k]) path.push([0, k]);

  snapshot(`Longest increasing subsequence has length ${dp[best]}.`, {
    path: path.reverse(),
  });

  return recorder.build();
};

export const lisModule: AlgorithmModule<DpState, number[]> = {
  id: 'lis',
  name: 'Longest Increasing Subsequence',
  category: 'dp',
  tagline: 'For each element, the longest increasing run that ends on it.',
  accent: '#a3e635',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Pairs compared',
    swaps: 'Extensions',
    accesses: 'Lookups',
  },
  info: {
    explanation:
      'The longest increasing subsequence keeps elements in their original order while strictly increasing. The O(n²) DP defines dp[i] as the length of the longest increasing subsequence ending exactly at index i: look back at every earlier element that is smaller and take the best run, then add one. The answer is the largest dp value, and following the predecessors reconstructs the subsequence.',
    complexity: {
      timeBest: 'O(n²)',
      timeAverage: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(n)',
    },
    useCases: [
      'Patience sorting / card games',
      'Box stacking and activity chaining',
      'Trend and version-compatibility analysis',
    ],
    realWorld: [
      'Longest chain of compatible upgrades',
      'Stock-run and sequence analytics',
    ],
  },
  createDefaultInput: () => [10, 9, 2, 5, 3, 7, 101, 18],
  generate,
};
