import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export type UfOp =
  | { kind: 'union'; a: number; b: number }
  | { kind: 'find'; a: number };

export interface UnionFindInput {
  count: number;
  ops: UfOp[];
}

export interface UnionFindState {
  parent: number[];
  rank: number[];
  highlight: number[];
  activePair: [number, number] | null;
  compressed: number[];
}

export const createUfState = (
  parent: number[],
  rank: number[],
  partial: Partial<UnionFindState> = {}
): UnionFindState => ({
  parent: [...parent],
  rank: [...rank],
  highlight: [],
  activePair: null,
  compressed: [],
  ...partial,
});

const SOURCE = `function find(x) {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]]; // path compression
    x = parent[x];
  }
  return x;
}

function union(a, b) {
  const ra = find(a), rb = find(b);
  if (ra === rb) return;          // already connected
  if (rank[ra] < rank[rb]) parent[ra] = rb;
  else if (rank[ra] > rank[rb]) parent[rb] = ra;
  else { parent[rb] = ra; rank[ra]++; }
}`;

export const randomUnionFind = (count = 8): UnionFindInput => {
  const ids = Array.from({ length: count }, (_, i) => i);
  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  const ops: UfOp[] = [];
  for (let i = 1; i < count; i += 1) {
    const a = shuffled[Math.floor(Math.random() * i)];
    ops.push({ kind: 'union', a, b: shuffled[i] });
  }
  ops.push({ kind: 'find', a: count - 1 });
  ops.push({ kind: 'find', a: Math.floor(count / 2) });
  return { count, ops };
};

const defaultInput = (): UnionFindInput => ({
  count: 8,
  ops: [
    { kind: 'union', a: 0, b: 1 },
    { kind: 'union', a: 2, b: 3 },
    { kind: 'union', a: 0, b: 2 },
    { kind: 'union', a: 4, b: 5 },
    { kind: 'union', a: 6, b: 7 },
    { kind: 'union', a: 4, b: 6 },
    { kind: 'union', a: 0, b: 4 },
    { kind: 'find', a: 7 },
    { kind: 'find', a: 3 },
  ],
});

const generate = (input: UnionFindInput): Timeline<UnionFindState> => {
  const recorder = new TimelineRecorder<UnionFindState>();
  const parent = Array.from({ length: input.count }, (_, i) => i);
  const rank = new Array<number>(input.count).fill(0);

  const snapshot = (
    description: string,
    partial: Partial<UnionFindState>
  ): void => {
    recorder.capture(createUfState(parent, rank, partial), description);
  };

  const pathToRoot = (x: number): { root: number; path: number[] } => {
    const path: number[] = [];
    let r = x;
    while (parent[r] !== r) {
      path.push(r);
      r = parent[r];
    }
    return { root: r, path };
  };

  snapshot(
    `${input.count} singleton sets — every element is its own root.`,
    {}
  );

  for (const op of input.ops) {
    if (op.kind === 'find') {
      const { root, path } = pathToRoot(op.a);
      recorder.countAccess(path.length + 1);
      snapshot(`find(${op.a}): follow parent pointers up to root ${root}.`, {
        highlight: [...path, root],
      });
      const compressed = path.filter((node) => parent[node] !== root);
      if (compressed.length > 0) {
        compressed.forEach((node) => (parent[node] = root));
        recorder.countSwap(compressed.length);
        snapshot(
          `Path compression: repoint ${compressed.join(', ')} straight at ${root}.`,
          { highlight: [...compressed, root], compressed }
        );
      } else {
        snapshot(`${op.a} already sits one hop from its root — nothing to flatten.`, {
          highlight: [op.a, root],
        });
      }
      continue;
    }

    recorder.countComparison();
    const ra = pathToRoot(op.a).root;
    const rb = pathToRoot(op.b).root;
    snapshot(`union(${op.a}, ${op.b}): their roots are ${ra} and ${rb}.`, {
      activePair: [op.a, op.b],
      highlight: [ra, rb],
    });

    if (ra === rb) {
      snapshot(`Same root already — they are connected, skip to avoid a cycle.`, {
        highlight: [ra],
      });
      continue;
    }

    let root: number;
    let child: number;
    if (rank[ra] < rank[rb]) {
      parent[ra] = rb;
      root = rb;
      child = ra;
    } else if (rank[ra] > rank[rb]) {
      parent[rb] = ra;
      root = ra;
      child = rb;
    } else {
      parent[rb] = ra;
      rank[ra] += 1;
      root = ra;
      child = rb;
    }
    recorder.countSwap();
    snapshot(`Attach root ${child} under root ${root} (union by rank).`, {
      activePair: [op.a, op.b],
      highlight: [root, child],
    });
  }

  snapshot('Done — the colours show the final disjoint sets.', {});
  return recorder.build();
};

export const unionFindModule: AlgorithmModule<UnionFindState, UnionFindInput> = {
  id: 'union-find',
  name: 'Union-Find',
  category: 'structure',
  tagline: 'Merge sets by rank and flatten lookups with path compression.',
  accent: '#34d399',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Unions tried',
    swaps: 'Pointer updates',
    accesses: 'Parent hops',
  },
  info: {
    explanation:
      'A disjoint-set forest represents each set as a tree of parent pointers. union-by-rank always hangs the shorter tree under the taller one, and path compression flattens a find by pointing every node it passes directly at the root. Together they make any sequence of m operations run in near-linear O(m·α(n)) time, where α is the inverse-Ackermann function — effectively constant.',
    complexity: {
      timeBest: 'O(α(n))',
      timeAverage: 'O(α(n))',
      timeWorst: 'O(α(n)) amortised',
      space: 'O(n)',
    },
    useCases: [
      'Connected components of a graph',
      'Cycle detection while building a spanning tree',
      'Dynamic connectivity / grouping queries',
    ],
    realWorld: [
      "Kruskal's minimum-spanning-tree algorithm",
      'Percolation, image segmentation, and clustering',
    ],
  },
  createDefaultInput: defaultInput,
  generate,
};
