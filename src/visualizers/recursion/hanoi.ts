import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export interface HanoiState {
  pegs: number[][];
  moving: number | null;
  from: number | null;
  to: number | null;
  moves: number;
  total: number;
  numDisks: number;
}

export const createHanoiState = (
  pegs: number[][],
  partial: Partial<HanoiState> & Pick<HanoiState, 'total' | 'numDisks' | 'moves'>
): HanoiState => ({
  pegs: pegs.map((peg) => [...peg]),
  moving: null,
  from: null,
  to: null,
  ...partial,
});

const SOURCE = `function hanoi(n, from, to, via) {
  if (n === 0) return;
  hanoi(n - 1, from, via, to);   // free the bottom disk
  move(from, to);                // move it across
  hanoi(n - 1, via, to, from);   // rebuild on top
}`;

const generate = (numDisks: number): Timeline<HanoiState> => {
  const recorder = new TimelineRecorder<HanoiState>();
  const n = Math.max(1, Math.min(numDisks, 7));
  const pegs: number[][] = [
    Array.from({ length: n }, (_, i) => n - i),
    [],
    [],
  ];
  const total = 2 ** n - 1;
  let moves = 0;
  const names = ['A', 'B', 'C'];

  const snapshot = (description: string, partial: Partial<HanoiState>): void => {
    recorder.capture(createHanoiState(pegs, { total, numDisks: n, moves, ...partial }), description);
  };

  snapshot(`Move all ${n} disks from A to C — one disk at a time, never larger on smaller.`, {});

  const doMove = (from: number, to: number): void => {
    const disk = pegs[from].pop() as number;
    pegs[to].push(disk);
    moves += 1;
    recorder.countSwap();
    snapshot(`Move disk ${disk}: ${names[from]} → ${names[to]} (${moves}/${total}).`, {
      moving: disk,
      from,
      to,
    });
  };

  const hanoi = (count: number, from: number, to: number, via: number): void => {
    if (count === 0) return;
    recorder.countComparison();
    hanoi(count - 1, from, via, to);
    doMove(from, to);
    hanoi(count - 1, via, to, from);
  };

  hanoi(n, 0, 2, 1);
  snapshot(`Done in ${moves} moves — the minimum is 2^${n} − 1 = ${total}.`, {});

  return recorder.build();
};

export const hanoiModule: AlgorithmModule<HanoiState, number> = {
  id: 'tower-of-hanoi',
  name: 'Tower of Hanoi',
  category: 'recursion',
  tagline: 'Move a stack of disks across pegs — recursion in its purest form.',
  accent: '#22d3ee',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Recursive calls',
    swaps: 'Disk moves',
    accesses: 'Steps',
  },
  info: {
    explanation:
      'The Tower of Hanoi moves a stack of disks from one peg to another, never placing a larger disk on a smaller one. The recursive insight: to move n disks, first move the top n−1 onto the spare peg, move the largest disk across, then move the n−1 back on top. The two self-similar subproblems make it the canonical recursion demo — and it always takes exactly 2ⁿ − 1 moves.',
    complexity: {
      timeBest: 'O(2ⁿ)',
      timeAverage: 'O(2ⁿ)',
      timeWorst: 'O(2ⁿ)',
      space: 'O(n)',
    },
    useCases: [
      'Teaching recursion and induction',
      'Recurrence-relation analysis',
      'Gray-code and state-sequence generation',
    ],
    realWorld: [
      'Backup rotation schemes',
      'Benchmark for recursive call overhead',
    ],
  },
  createDefaultInput: () => 3,
  generate,
};
