import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export interface PermState {
  items: number[];
  current: number[];
  used: boolean[];
  results: number[][];
  active: number | null;
}

export const createPermState = (
  items: number[],
  partial: Partial<PermState> = {}
): PermState => ({
  items,
  current: [],
  used: items.map(() => false),
  results: [],
  active: null,
  ...partial,
});

const SOURCE = `function permute(items, current, used, out) {
  if (current.length === items.length) { out.push([...current]); return; }
  for (let i = 0; i < items.length; i++) {
    if (used[i]) continue;
    used[i] = true; current.push(items[i]);   // choose
    permute(items, current, used, out);
    used[i] = false; current.pop();           // un-choose (backtrack)
  }
}`;

const generate = (input: number[]): Timeline<PermState> => {
  const recorder = new TimelineRecorder<PermState>();
  const items = input.slice(0, 5);
  const used = items.map(() => false);
  const current: number[] = [];
  const results: number[][] = [];

  const snapshot = (description: string, partial: Partial<PermState>): void => {
    recorder.capture(
      createPermState(items, {
        current: [...current],
        used: [...used],
        results: results.map((r) => [...r]),
        ...partial,
      }),
      description
    );
  };

  snapshot(`Build every ordering of [${items.join(', ')}] by choosing and undoing.`, {});

  const backtrack = (): void => {
    if (current.length === items.length) {
      results.push([...current]);
      snapshot(`Complete permutation [${current.join(', ')}].`, {
        results: results.map((r) => [...r]),
      });
      return;
    }
    for (let i = 0; i < items.length; i += 1) {
      if (used[i]) continue;
      recorder.countComparison();
      used[i] = true;
      current.push(items[i]);
      recorder.countSwap();
      snapshot(`Choose ${items[i]} → [${current.join(', ')}].`, {
        active: i,
        current: [...current],
        used: [...used],
      });
      backtrack();
      used[i] = false;
      current.pop();
      snapshot(`Backtrack: drop ${items[i]}.`, {
        current: [...current],
        used: [...used],
      });
    }
  };
  backtrack();

  snapshot(`Generated all ${results.length} permutations.`, {
    results: results.map((r) => [...r]),
  });
  return recorder.build();
};

export const permutationsModule: AlgorithmModule<PermState, number[]> = {
  id: 'permutations',
  name: 'Permutations',
  category: 'recursion',
  tagline: 'Generate every ordering by choosing an item, recursing, and undoing.',
  accent: '#a855f7',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Choices considered',
    swaps: 'Picks',
    accesses: 'Steps',
  },
  info: {
    explanation:
      'Generating all permutations is the textbook backtracking pattern: at each position, try every unused item, recurse to fill the next position, then undo the choice and try the next. The “choose → explore → un-choose” rhythm visits the entire decision tree, emitting one complete arrangement at each leaf. There are n! leaves, so it is inherently factorial.',
    complexity: {
      timeBest: 'O(n!)',
      timeAverage: 'O(n!)',
      timeWorst: 'O(n!)',
      space: 'O(n)',
    },
    useCases: [
      'Exhaustive search over orderings',
      'Generating test cases / anagrams',
      'Brute-force TSP and scheduling',
    ],
    realWorld: [
      'Small-scale route enumeration',
      'Puzzle and constraint solvers',
    ],
  },
  createDefaultInput: () => [1, 2, 3],
  generate,
};
