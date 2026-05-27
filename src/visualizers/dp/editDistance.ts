import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  createDpState,
  emptyGrid,
  type DpState,
  type StringPairInput,
} from './types';

const SOURCE = `function editDistance(a, b) {
  const dp = grid(b.length + 1, a.length + 1, 0);
  for (let i = 0; i <= b.length; i++) dp[i][0] = i;
  for (let j = 0; j <= a.length; j++) dp[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
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

  for (let i = 0; i < rows; i += 1) grid[i][0] = i;
  for (let j = 0; j < cols; j += 1) grid[0][j] = j;
  snapshot('Base case: editing to/from an empty string costs its length.', {});

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      recorder.countComparison();
      if (b[i - 1] === a[j - 1]) {
        grid[i][j] = grid[i - 1][j - 1];
        recorder.countSwap();
        snapshot(`"${b[i - 1]}" matches — copy the diagonal (${grid[i][j]}).`, {
          current: [i, j],
          dependencies: [[i - 1, j - 1]],
        });
      } else {
        grid[i][j] =
          1 +
          Math.min(
            grid[i - 1][j] ?? 0,
            grid[i][j - 1] ?? 0,
            grid[i - 1][j - 1] ?? 0
          );
        snapshot(
          `Differs — 1 + min(delete, insert, replace) = ${grid[i][j]}.`,
          {
            current: [i, j],
            dependencies: [
              [i - 1, j],
              [i, j - 1],
              [i - 1, j - 1],
            ],
          }
        );
      }
    }
  }

  snapshot(
    `Minimum edits to turn "${a}" into "${b}" = ${grid[rows - 1][cols - 1]}.`,
    { current: [rows - 1, cols - 1] }
  );

  return recorder.build();
};

export const editDistanceModule: AlgorithmModule<DpState, StringPairInput> = {
  id: 'edit-distance',
  name: 'Edit Distance',
  category: 'dp',
  tagline: 'Fewest insert/delete/replace edits between two strings.',
  accent: '#fb7185',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Cells filled',
    swaps: 'Matches',
    accesses: 'Lookups',
  },
  info: {
    explanation:
      'The Levenshtein edit distance is the minimum number of single-character insertions, deletions, or substitutions to turn one string into another. Each cell combines its three neighbours: matching characters copy the diagonal, otherwise it costs one plus the cheapest neighbour.',
    complexity: {
      timeBest: 'O(m·n)',
      timeAverage: 'O(m·n)',
      timeWorst: 'O(m·n)',
      space: 'O(m·n)',
    },
    useCases: [
      'Spell-checking and autocorrect',
      'Fuzzy string matching',
      'DNA mutation distance',
    ],
    realWorld: [
      'Search-engine "did you mean?" suggestions',
      'Autocomplete and typo correction',
    ],
  },
  createDefaultInput: () => ({ a: 'kitten', b: 'sitting' }),
  generate,
};
