import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  createDpState,
  emptyGrid,
  type DpState,
  type KnapsackInput,
} from './types';

const SOURCE = `function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = grid(n + 1, W + 1, 0);
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i - 1][w];
      if (weights[i - 1] <= w) {
        const take = dp[i - 1][w - weights[i - 1]] + values[i - 1];
        dp[i][w] = Math.max(dp[i][w], take);
      }
    }
  }
  return dp[n][W];
}`;

const generate = (input: KnapsackInput): Timeline<DpState> => {
  const weights = input.weights.slice(0, 6);
  const values = input.values.slice(0, 6);
  const capacity = Math.min(input.capacity, 12);
  const n = weights.length;
  const rows = n + 1;
  const cols = capacity + 1;
  const grid = emptyGrid(rows, cols);
  const rowHeader = ['∅', ...weights.map((w, k) => `${w}kg·$${values[k]}`)];
  const colHeader = Array.from({ length: cols }, (_, w) => String(w));
  const recorder = new TimelineRecorder<DpState>();

  const snapshot = (description: string, partial: Partial<DpState>): void => {
    recorder.capture(
      createDpState({
        grid,
        rowHeader,
        colHeader,
        rowTitle: 'Items',
        colTitle: 'Capacity',
        ...partial,
      }),
      description
    );
  };

  for (let w = 0; w < cols; w += 1) grid[0][w] = 0;
  snapshot('With no items, the best value at every capacity is 0.', {});

  for (let i = 1; i < rows; i += 1) {
    const weight = weights[i - 1];
    const value = values[i - 1];
    for (let w = 0; w < cols; w += 1) {
      recorder.countComparison();
      const skip = grid[i - 1][w] ?? 0;
      if (weight <= w) {
        const take = (grid[i - 1][w - weight] ?? 0) + value;
        grid[i][w] = Math.max(skip, take);
        recorder.countSwap();
        snapshot(
          `Capacity ${w}: max(skip ${skip}, take ${take}) = ${grid[i][w]}.`,
          {
            current: [i, w],
            dependencies: [
              [i - 1, w],
              [i - 1, w - weight],
            ],
          }
        );
      } else {
        grid[i][w] = skip;
        snapshot(`Capacity ${w}: item too heavy — carry ${skip} down.`, {
          current: [i, w],
          dependencies: [[i - 1, w]],
        });
      }
    }
  }

  snapshot(`Best value within capacity ${capacity} = ${grid[n][cols - 1]}.`, {
    current: [n, cols - 1],
  });

  return recorder.build();
};

export const knapsackModule: AlgorithmModule<DpState, KnapsackInput> = {
  id: 'knapsack',
  name: '0/1 Knapsack',
  category: 'dp',
  tagline: 'Choose items to maximise value within a weight budget.',
  accent: '#a3e635',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Cells filled',
    swaps: 'Items considered',
    accesses: 'Lookups',
  },
  info: {
    explanation:
      'The 0/1 knapsack problem packs items (each taken once) to maximise value without exceeding a weight capacity. Each cell dp[i][w] is the best value using the first i items within capacity w: either skip the item, or take it and add the best value of the remaining capacity.',
    complexity: {
      timeBest: 'O(n·W)',
      timeAverage: 'O(n·W)',
      timeWorst: 'O(n·W)',
      space: 'O(n·W)',
    },
    useCases: [
      'Resource allocation under a budget',
      'Cargo and container loading',
      'Project selection with limited funds',
    ],
    realWorld: [
      'Budgeting and portfolio selection',
      'Cloud resource packing',
    ],
  },
  createDefaultInput: () => ({
    weights: [1, 3, 4, 5],
    values: [1, 4, 5, 7],
    capacity: 7,
  }),
  generate,
};
