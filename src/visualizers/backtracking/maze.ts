import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export type Coord = [number, number];

export interface MazeInput {
  rows: number;
  cols: number;
  grid: number[][];
  start: Coord;
  goal: Coord;
}

export interface MazeState {
  rows: number;
  cols: number;
  grid: number[][];
  start: Coord;
  goal: Coord;
  visited: string[];
  deadEnds: string[];
  path: Coord[];
  current: Coord | null;
  solved: boolean;
}

const key = (r: number, c: number): string => `${r},${c}`;

export const createMazeState = (
  input: MazeInput,
  partial: Partial<MazeState> = {}
): MazeState => ({
  rows: input.rows,
  cols: input.cols,
  grid: input.grid,
  start: input.start,
  goal: input.goal,
  visited: [],
  deadEnds: [],
  path: [],
  current: null,
  solved: false,
  ...partial,
});

const SOURCE = `function solve(r, c) {
  if (offGrid(r, c) || wall(r, c) || seen(r, c)) return false;
  visit(r, c); path.push([r, c]);
  if (r === goal.r && c === goal.c) return true;
  for (const [dr, dc] of [[1,0],[0,1],[-1,0],[0,-1]]) {
    if (solve(r + dr, c + dc)) return true;
  }
  path.pop();                       // dead end — backtrack
  return false;
}`;

export const generateMaze = (cells = 6): MazeInput => {
  const rows = cells * 2 + 1;
  const cols = cells * 2 + 1;
  const grid = Array.from({ length: rows }, () =>
    new Array<number>(cols).fill(1)
  );

  const carve = (r: number, c: number): void => {
    grid[r][c] = 0;
    const dirs: Coord[] = [
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2],
    ].sort(() => Math.random() - 0.5) as Coord[];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && grid[nr][nc] === 1) {
        grid[r + dr / 2][c + dc / 2] = 0;
        carve(nr, nc);
      }
    }
  };
  carve(1, 1);

  return { rows, cols, grid, start: [1, 1], goal: [rows - 2, cols - 2] };
};

const DIRS: Coord[] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

const generate = (input: MazeInput): Timeline<MazeState> => {
  const recorder = new TimelineRecorder<MazeState>();
  const { rows, cols, grid, start, goal } = input;
  const visited = new Set<string>();
  const deadEnds = new Set<string>();
  const path: Coord[] = [];

  const snapshot = (description: string, partial: Partial<MazeState>): void => {
    recorder.capture(
      createMazeState(input, {
        visited: [...visited],
        deadEnds: [...deadEnds],
        path: path.map(([r, c]): Coord => [r, c]),
        ...partial,
      }),
      description
    );
  };

  const solve = (r: number, c: number): boolean => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (grid[r][c] === 1 || visited.has(key(r, c))) return false;

    visited.add(key(r, c));
    path.push([r, c]);
    recorder.countAccess();
    snapshot(`Step into (${r}, ${c}).`, { current: [r, c] });

    if (r === goal[0] && c === goal[1]) {
      snapshot('Reached the goal — trace the path back to the start!', {
        current: [r, c],
        solved: true,
      });
      return true;
    }

    for (const [dr, dc] of DIRS) {
      recorder.countComparison();
      if (solve(r + dr, c + dc)) return true;
    }

    path.pop();
    deadEnds.add(key(r, c));
    recorder.countSwap();
    snapshot(`(${r}, ${c}) is a dead end — backtrack.`, { current: [r, c] });
    return false;
  };

  snapshot('Explore the maze depth-first; back out of every dead end.', {
    current: start,
  });
  const solved = solve(start[0], start[1]);
  if (!solved) {
    snapshot('No path exists — every route from the start is blocked.', {});
  }

  return recorder.build();
};

export const mazeModule: AlgorithmModule<MazeState, MazeInput> = {
  id: 'maze-solver',
  name: 'Maze Solver',
  category: 'backtracking',
  tagline: 'Depth-first search with backtracking carves a path out of the maze.',
  accent: '#22d3ee',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Moves tried',
    swaps: 'Backtracks',
    accesses: 'Cells visited',
  },
  info: {
    explanation:
      'Solving a maze is backtracking on a grid. From the start we step into an open, unvisited cell, mark it, and recurse into its neighbours; if every direction dead-ends we pop the cell off the path and retreat. The first route that reaches the goal is the answer. It is exactly depth-first search with an explicit undo step.',
    complexity: {
      timeBest: 'O(V + E)',
      timeAverage: 'O(V + E)',
      timeWorst: 'O(V + E)',
      space: 'O(V)',
    },
    useCases: [
      'Pathfinding in grids and games',
      'Flood fill and reachability',
      'Generating and solving mazes',
    ],
    realWorld: [
      'Robot/vacuum navigation',
      'Routing on tile maps',
    ],
  },
  createDefaultInput: () => generateMaze(6),
  generate,
};
