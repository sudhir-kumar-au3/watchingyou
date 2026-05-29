import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import { createDpState, type DpState } from './types';

export interface CoinInput {
  coins: number[];
  amount: number;
}

const SOURCE = `function coinChange(coins, amount) {
  // dp[i][j] = fewest coins for amount j using the first i coin types
  for (let i = 1; i <= coins.length; i++)
    for (let j = 0; j <= amount; j++) {
      dp[i][j] = dp[i - 1][j];                        // skip coin i
      if (j >= coins[i - 1] && dp[i][j - coins[i - 1]] != null)
        dp[i][j] = min(dp[i][j], dp[i][j - coins[i - 1]] + 1);
    }
  return dp[coins.length][amount];
}`;

export const randomCoinInput = (): CoinInput => {
  const pool = [1, 2, 3, 4, 5, 6, 7];
  const coins: number[] = [1];
  while (coins.length < 3) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!coins.includes(pick)) coins.push(pick);
  }
  coins.sort((a, b) => a - b);
  return { coins, amount: Math.floor(Math.random() * 8) + 6 };
};

const generate = (input: CoinInput): Timeline<DpState> => {
  const coins = input.coins.slice(0, 5);
  const amount = Math.min(input.amount, 14);
  const k = coins.length;
  const cols = amount + 1;
  const grid: (number | null)[][] = Array.from({ length: k + 1 }, () =>
    new Array<number | null>(cols).fill(null)
  );
  const rowHeader = ['∅', ...coins.map(String)];
  const colHeader = Array.from({ length: cols }, (_, j) => String(j));
  const recorder = new TimelineRecorder<DpState>();

  const snapshot = (description: string, partial: Partial<DpState>): void => {
    recorder.capture(
      createDpState({
        grid: grid.map((row) => [...row]),
        rowHeader,
        colHeader,
        rowTitle: 'coins',
        colTitle: 'amount',
        ...partial,
      }),
      description
    );
  };

  grid[0][0] = 0;
  snapshot('With no coins, only amount 0 is reachable (0 coins).', {});

  for (let i = 1; i <= k; i += 1) {
    const coin = coins[i - 1];
    for (let j = 0; j < cols; j += 1) {
      recorder.countComparison();
      let best = grid[i - 1][j];
      const deps: [number, number][] = [[i - 1, j]];
      if (j >= coin) {
        deps.push([i, j - coin]);
        const viaCoin = grid[i][j - coin];
        if (viaCoin !== null && (best === null || viaCoin + 1 < best)) {
          best = viaCoin + 1;
          recorder.countSwap();
        }
      }
      grid[i][j] = best;
      snapshot(
        `Coin ${coin}, amount ${j}: fewest = ${best === null ? '∞' : best}.`,
        { current: [i, j], dependencies: deps }
      );
    }
  }

  const path: [number, number][] = [];
  let i = k;
  let j = amount;
  while (i > 0 && j >= 0 && grid[i][j] !== null) {
    path.push([i, j]);
    if (grid[i][j] === grid[i - 1][j]) {
      i -= 1;
    } else {
      j -= coins[i - 1];
    }
  }

  const total = grid[k][amount];
  snapshot(
    total === null
      ? `Amount ${amount} cannot be made from these coins.`
      : `Amount ${amount} needs at least ${total} coin${total === 1 ? '' : 's'}.`,
    { path }
  );

  return recorder.build();
};

export const coinChangeModule: AlgorithmModule<DpState, CoinInput> = {
  id: 'coin-change',
  name: 'Coin Change',
  category: 'dp',
  tagline: 'Fewest coins to make an amount — fill a coins × amount table.',
  accent: '#fbbf24',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Cells filled',
    swaps: 'Improvements',
    accesses: 'Lookups',
  },
  info: {
    explanation:
      'Coin change asks for the fewest coins that sum to a target amount, with unlimited coins of each denomination. The DP table dp[i][j] is the fewest coins for amount j using the first i denominations: either skip denomination i (inherit from the row above) or use one more of it (dp[i][j − coin] + 1). Greedy can fail (e.g. coins {1,3,4} for 6), but the table is always optimal.',
    complexity: {
      timeBest: 'O(k·amount)',
      timeAverage: 'O(k·amount)',
      timeWorst: 'O(k·amount)',
      space: 'O(k·amount)',
    },
    useCases: [
      'Making change with fewest coins/notes',
      'Unbounded-knapsack style problems',
      'Min-operations-to-target DP',
    ],
    realWorld: [
      'Cash dispensers and vending machines',
      'Token / fee minimization',
    ],
  },
  createDefaultInput: () => ({ coins: [1, 3, 4], amount: 6 }),
  generate,
};
