import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export interface FloydEdge {
  from: number;
  to: number;
  weight: number;
}

export interface FloydInput {
  labels: string[];
  edges: FloydEdge[];
}

export interface FloydState {
  labels: string[];
  dist: number[][];
  k: number | null;
  i: number | null;
  j: number | null;
  updated: boolean;
  phase: 'init' | 'scan' | 'done';
}

export const createFloydState = (
  labels: string[],
  dist: number[][],
  partial: Partial<FloydState> = {}
): FloydState => ({
  labels,
  dist: dist.map((row) => [...row]),
  k: null,
  i: null,
  j: null,
  updated: false,
  phase: 'scan',
  ...partial,
});

export const randomFloydInput = (): FloydInput => {
  const labels = ['A', 'B', 'C', 'D'];
  const n = labels.length;
  const edges: FloydEdge[] = [];
  for (let from = 0; from < n; from += 1) {
    for (let to = 0; to < n; to += 1) {
      if (from !== to && Math.random() < 0.5) {
        edges.push({ from, to, weight: Math.floor(Math.random() * 9) + 1 });
      }
    }
  }
  if (edges.length === 0) edges.push({ from: 0, to: 1, weight: 4 });
  return { labels, edges };
};

const SOURCE = `for (let k = 0; k < n; k++)
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (dist[i][k] + dist[k][j] < dist[i][j])
        dist[i][j] = dist[i][k] + dist[k][j];   // relax via k`;

const generate = (input: FloydInput): Timeline<FloydState> => {
  const recorder = new TimelineRecorder<FloydState>();
  const n = input.labels.length;
  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity))
  );
  input.edges.forEach(({ from, to, weight }) => {
    dist[from][to] = Math.min(dist[from][to], weight);
  });

  const snapshot = (description: string, partial: Partial<FloydState>): void => {
    recorder.capture(createFloydState(input.labels, dist, partial), description);
  };

  snapshot('Start from the direct-edge matrix (∞ where there is no edge).', {
    phase: 'init',
  });

  for (let k = 0; k < n; k += 1) {
    snapshot(`Allow paths through ${input.labels[k]} as an intermediate stop.`, {
      k,
    });
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        recorder.countComparison();
        const through = dist[i][k] + dist[k][j];
        const better = through < dist[i][j];
        if (better) {
          dist[i][j] = through;
          recorder.countSwap();
        }
        snapshot(
          better
            ? `${input.labels[i]}→${input.labels[j]} via ${input.labels[k]} = ${through} — shorter, update.`
            : `${input.labels[i]}→${input.labels[j]}: keeping ${dist[i][j] === Infinity ? '∞' : dist[i][j]}.`,
          { k, i, j, updated: better }
        );
      }
    }
  }

  snapshot('All pairs settled — every cell is the shortest distance.', {
    phase: 'done',
  });
  return recorder.build();
};

export const floydWarshallModule: AlgorithmModule<FloydState, FloydInput> = {
  id: 'floyd-warshall',
  name: 'Floyd-Warshall',
  category: 'graph',
  tagline: 'All-pairs shortest paths by relaxing through one intermediate at a time.',
  accent: '#818cf8',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Cells checked',
    swaps: 'Relaxations',
    accesses: 'Lookups',
  },
  info: {
    explanation:
      'Floyd-Warshall finds the shortest path between every pair of vertices with a three-line triple loop. The outer loop fixes an intermediate vertex k; for every pair (i, j) it asks whether going i→k→j beats the best known i→j, and if so updates it. After every vertex has had its turn as an intermediate, the matrix holds all-pairs shortest distances — it even handles negative edges (as long as there is no negative cycle).',
    complexity: {
      timeBest: 'O(V³)',
      timeAverage: 'O(V³)',
      timeWorst: 'O(V³)',
      space: 'O(V²)',
    },
    useCases: [
      'All-pairs shortest paths on dense graphs',
      'Transitive closure / reachability',
      'Routing and distance tables',
    ],
    realWorld: [
      'Network routing distance matrices',
      'Arbitrage and flight-connection tables',
    ],
  },
  createDefaultInput: () => ({
    labels: ['A', 'B', 'C', 'D'],
    edges: [
      { from: 0, to: 1, weight: 3 },
      { from: 0, to: 2, weight: 8 },
      { from: 0, to: 3, weight: 9 },
      { from: 1, to: 2, weight: 2 },
      { from: 1, to: 3, weight: 10 },
      { from: 2, to: 3, weight: 1 },
    ],
  }),
  generate,
};
