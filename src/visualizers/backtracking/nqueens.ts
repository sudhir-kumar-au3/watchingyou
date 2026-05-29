import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export interface NQueensState {
  n: number;
  queens: number[];
  activeRow: number;
  tryCol: number | null;
  rejected: boolean;
  solved: boolean;
}

export const createNQueensState = (
  n: number,
  partial: Partial<NQueensState> = {}
): NQueensState => ({
  n,
  queens: new Array<number>(n).fill(-1),
  activeRow: 0,
  tryCol: null,
  rejected: false,
  solved: false,
  ...partial,
});

const SOURCE = `function solve(board, row) {
  if (row === board.n) return true;          // all rows filled
  for (let col = 0; col < board.n; col++) {
    if (safe(board, row, col)) {             // no queen attacks (row,col)
      board.queens[row] = col;               // place
      if (solve(board, row + 1)) return true;
      board.queens[row] = -1;                // backtrack
    }
  }
  return false;                              // dead end
}`;

const generate = (n: number): Timeline<NQueensState> => {
  const recorder = new TimelineRecorder<NQueensState>();
  const queens = new Array<number>(n).fill(-1);

  const snapshot = (
    description: string,
    partial: Partial<NQueensState>
  ): void => {
    recorder.capture(
      createNQueensState(n, { queens: [...queens], ...partial }),
      description
    );
  };

  const safe = (row: number, col: number): boolean => {
    for (let r = 0; r < row; r += 1) {
      const c = queens[r];
      if (c === col) return false;
      if (Math.abs(c - col) === Math.abs(r - row)) return false;
    }
    return true;
  };

  const solve = (row: number): boolean => {
    if (row === n) {
      snapshot('Every row holds a queen — no two attack. Solved!', {
        activeRow: n,
        solved: true,
      });
      return true;
    }
    for (let col = 0; col < n; col += 1) {
      recorder.countComparison();
      snapshot(`Try a queen at row ${row + 1}, column ${col + 1}.`, {
        activeRow: row,
        tryCol: col,
      });
      if (safe(row, col)) {
        queens[row] = col;
        recorder.countAccess();
        snapshot(`Column ${col + 1} is safe — place a queen and descend.`, {
          activeRow: row,
          tryCol: col,
        });
        if (solve(row + 1)) return true;
        queens[row] = -1;
        recorder.countSwap();
        snapshot(`No solution below — backtrack and clear row ${row + 1}.`, {
          activeRow: row,
          tryCol: col,
        });
      } else {
        snapshot(`Column ${col + 1} is attacked — reject it.`, {
          activeRow: row,
          tryCol: col,
          rejected: true,
        });
      }
    }
    return false;
  };

  snapshot(`Place ${n} queens so that none attack along a row, column, or diagonal.`, {
    activeRow: 0,
  });
  solve(0);

  return recorder.build();
};

export const nQueensModule: AlgorithmModule<NQueensState, number> = {
  id: 'n-queens',
  name: 'N-Queens',
  category: 'backtracking',
  tagline: 'Place N queens with no two attacking — search, reject, and backtrack.',
  accent: '#a855f7',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Cells tested',
    swaps: 'Backtracks',
    accesses: 'Queens placed',
  },
  info: {
    explanation:
      'The N-Queens puzzle asks for N queens on an N×N board with no two sharing a row, column, or diagonal. Backtracking places one queen per row: at each row it tries columns left to right, keeping only safe ones, recursing to the next row, and undoing (backtracking) when a row runs out of safe columns. The search tree is pruned the instant a placement conflicts.',
    complexity: {
      timeBest: 'O(n!)',
      timeAverage: 'O(n!)',
      timeWorst: 'O(n!)',
      space: 'O(n)',
    },
    useCases: [
      'Constraint-satisfaction problems',
      'Exhaustive search with pruning',
      'Teaching recursion and backtracking',
    ],
    realWorld: [
      'Scheduling and resource allocation',
      'Sudoku and other constraint solvers',
    ],
  },
  createDefaultInput: () => 6,
  generate,
};
