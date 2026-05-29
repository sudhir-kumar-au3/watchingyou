import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { createDpState, type DpState } from './types';

export interface SubsetInput {
  values: number[];
  target: number;
}

const SOURCE = `function subsetSum(v, target) {
  // dp[i][j] = can a subset of the first i items sum to j?
  dp[0][0] = true;
  for (let i = 1; i <= v.length; i++)
    for (let j = 0; j <= target; j++)
      dp[i][j] = dp[i - 1][j]                       // exclude item i
        || (j >= v[i - 1] && dp[i - 1][j - v[i - 1]]); // include item i
  return dp[v.length][target];
}`;

export const randomSubsetInput = (): SubsetInput => {
  const values = Array.from({ length: 5 }, () => Math.floor(Math.random() * 7) + 1);
  const subsetSize = Math.floor(Math.random() * 3) + 1;
  let target = 0;
  for (let k = 0; k < subsetSize; k += 1) {
    target += values[Math.floor(Math.random() * values.length)];
  }
  return { values, target };
};

const generate = (input: SubsetInput): Timeline<DpState> => {
  const values = input.values.slice(0, 6);
  const target = Math.min(input.target, 16);
  const n = values.length;
  const cols = target + 1;
  const grid: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    new Array<number | null>(cols).fill(0)
  );
  const rowHeader = ['∅', ...values.map(String)];
  const colHeader = Array.from({ length: cols }, (_, j) => String(j));
  const recorder = new TimelineRecorder<DpState>();

  const snapshot = (description: string, partial: Partial<DpState>): void => {
    recorder.capture(
      createDpState({
        grid: grid.map((row) => [...row]),
        rowHeader,
        colHeader,
        rowTitle: 'items',
        colTitle: 'sum',
        ...partial,
      }),
      description
    );
  };

  grid[0][0] = 1;
  snapshot('The empty subset sums to 0 — every other base cell is false.', {});

  for (let i = 1; i <= n; i += 1) {
    const value = values[i - 1];
    for (let j = 0; j < cols; j += 1) {
      recorder.countComparison();
      const exclude = grid[i - 1][j] === 1;
      const deps: [number, number][] = [[i - 1, j]];
      let reachable = exclude;
      if (j >= value) {
        deps.push([i - 1, j - value]);
        if (grid[i - 1][j - value] === 1) {
          reachable = true;
          if (!exclude) recorder.countSwap();
        }
      }
      grid[i][j] = reachable ? 1 : 0;
      snapshot(
        `Item ${value}, sum ${j}: ${reachable ? 'reachable' : 'not reachable'}.`,
        { current: [i, j], dependencies: deps }
      );
    }
  }

  const path: [number, number][] = [];
  if (grid[n][target] === 1) {
    let i = n;
    let j = target;
    while (i > 0) {
      path.push([i, j]);
      if (grid[i - 1][j] === 1) {
        i -= 1;
      } else {
        j -= values[i - 1];
        i -= 1;
      }
    }
    if (j >= 0) path.push([0, j]);
  }

  snapshot(
    grid[n][target] === 1
      ? `A subset sums to ${target}.`
      : `No subset sums to ${target}.`,
    { path }
  );

  return recorder.build();
};

export const subsetSumModule: AlgorithmModule<DpState, SubsetInput> = {
  id: 'subset-sum',
  name: 'Subset Sum',
  category: 'dp',
  tagline: 'Can any subset of the items add up to the target? Fill a reachability table.',
  accent: '#a855f7',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Cells filled',
    swaps: 'Newly reachable',
    accesses: 'Lookups',
  },
  info: {
    explanation:
      'Subset sum asks whether some subset of the given numbers adds up exactly to a target. The boolean DP table dp[i][j] is true when a subset of the first i items reaches sum j: either reach j without item i (the cell above) or reach j − value(i) with the earlier items and then include item i. It is the decision version of the 0/1 knapsack and runs in pseudo-polynomial O(n·target) time.',
    complexity: {
      timeBest: 'O(n·target)',
      timeAverage: 'O(n·target)',
      timeWorst: 'O(n·target)',
      space: 'O(n·target)',
    },
    useCases: [
      'Partition into equal-sum halves',
      'Budget / capacity feasibility',
      '0/1 knapsack decision problems',
    ],
    realWorld: [
      'Load balancing and fair splitting',
      'Resource allocation feasibility',
    ],
  },
  createDefaultInput: () => ({ values: [3, 4, 5, 2], target: 9 }),
  generate,
};
