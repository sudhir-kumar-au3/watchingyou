import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  createDpState,
  emptyGrid,
  type DpState,
  type StringPairInput,
} from './types';

const SOURCE = `function lcs(a, b) {
  const dp = grid(b.length + 1, a.length + 1, 0);
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[b.length][a.length];
}`;

const generate = (input: StringPairInput): Timeline<DpState> => {
  const a = input.a.slice(0, 10);
  const b = input.b.slice(0, 10);
  const rows = b.length + 1;
  const cols = a.length + 1;
  const grid = emptyGrid(rows, cols);
  const rowHeader = ['∅', ...b.split('')];
  const colHeader = ['∅', ...a.split('')];
  const recorder = new TimelineRecorder<DpState>();

  const snapshot = (description: string, partial: Partial<DpState>): void => {
    recorder.capture(
      createDpState({
        grid,
        rowHeader,
        colHeader,
        rowTitle: `b = "${b}"`,
        colTitle: `a = "${a}"`,
        ...partial,
      }),
      description
    );
  };

  for (let j = 0; j < cols; j += 1) grid[0][j] = 0;
  for (let i = 0; i < rows; i += 1) grid[i][0] = 0;
  snapshot('Empty prefix gives an LCS of 0 — fill the base row and column.', {});

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      recorder.countComparison();
      if (b[i - 1] === a[j - 1]) {
        grid[i][j] = (grid[i - 1][j - 1] ?? 0) + 1;
        recorder.countSwap();
        snapshot(
          `"${b[i - 1]}" matches — take the diagonal + 1 = ${grid[i][j]}.`,
          { current: [i, j], dependencies: [[i - 1, j - 1]] }
        );
      } else {
        grid[i][j] = Math.max(grid[i - 1][j] ?? 0, grid[i][j - 1] ?? 0);
        snapshot(
          `No match — carry the larger of up/left = ${grid[i][j]}.`,
          {
            current: [i, j],
            dependencies: [
              [i - 1, j],
              [i, j - 1],
            ],
          }
        );
      }
    }
  }

  const path: [number, number][] = [];
  let i = rows - 1;
  let j = cols - 1;
  while (i > 0 && j > 0) {
    path.push([i, j]);
    if (b[i - 1] === a[j - 1]) {
      i -= 1;
      j -= 1;
    } else if ((grid[i - 1][j] ?? 0) >= (grid[i][j - 1] ?? 0)) {
      i -= 1;
    } else {
      j -= 1;
    }
  }

  snapshot(`Longest common subsequence has length ${grid[rows - 1][cols - 1]}.`, {
    path: path.reverse(),
  });

  return recorder.build();
};

export const lcsModule: AlgorithmModule<DpState, StringPairInput> = {
  id: 'lcs',
  name: 'Longest Common Subsequence',
  category: 'dp',
  tagline: 'Fill a grid to find the longest shared ordering of two strings.',
  accent: '#22d3ee',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Cells filled',
    swaps: 'Matches',
    accesses: 'Lookups',
  },
  info: {
    explanation:
      'The LCS of two strings is the longest subsequence present in both, preserving order but not contiguity. Each cell dp[i][j] holds the LCS length of the first i and j characters: equal characters extend the diagonal, otherwise the cell inherits the better of its top or left neighbour.',
    complexity: {
      timeBest: 'O(m·n)',
      timeAverage: 'O(m·n)',
      timeWorst: 'O(m·n)',
      space: 'O(m·n)',
    },
    useCases: [
      'Diff tools and version control',
      'DNA / sequence alignment',
      'Plagiarism and similarity detection',
    ],
    realWorld: [
      'git diff and file comparison',
      'Bioinformatics sequence matching',
    ],
  },
  createDefaultInput: () => ({ a: 'ABCBDAB', b: 'BDCAB' }),
  generate,
};
