import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  buildAdjacency,
  createGraphState,
  type GraphInput,
  type GraphState,
} from './types';

const bridgeSample = (): GraphInput => ({
  start: 'A',
  nodes: [
    { id: 'A', x: 14, y: 30 },
    { id: 'B', x: 14, y: 72 },
    { id: 'C', x: 36, y: 51 },
    { id: 'D', x: 60, y: 51 },
    { id: 'E', x: 82, y: 28 },
    { id: 'F', x: 90, y: 70 },
    { id: 'G', x: 64, y: 82 },
  ],
  edges: [
    { source: 'A', target: 'B' },
    { source: 'A', target: 'C' },
    { source: 'B', target: 'C' },
    { source: 'C', target: 'D' },
    { source: 'D', target: 'E' },
    { source: 'E', target: 'F' },
    { source: 'F', target: 'G' },
    { source: 'G', target: 'D' },
  ],
});

const SOURCE = `function dfs(u, parent) {
  disc[u] = low[u] = timer++;
  let children = 0;
  for (const v of adj[u]) {
    if (v === parent) continue;
    if (disc[v] !== undefined) low[u] = min(low[u], disc[v]);   // back edge
    else {
      children++; dfs(v, u);
      low[u] = min(low[u], low[v]);
      if (parent !== null && low[v] >= disc[u]) mark(u);        // cut vertex
    }
  }
  if (parent === null && children > 1) mark(u);                 // root case
}`;

const generate = (input: GraphInput): Timeline<GraphState> => {
  const { nodes, edges } = input;
  const adjacency = buildAdjacency(nodes, edges);
  const recorder = new TimelineRecorder<GraphState>();
  const disc: Record<string, number> = {};
  const low: Record<string, number> = {};
  const articulation = new Set<string>();
  const visitedOrder: string[] = [];
  let timer = 0;

  const snapshot = (description: string, partial: Partial<GraphState>): void => {
    recorder.capture(
      createGraphState(nodes, edges, {
        visited: [...visitedOrder],
        marked: [...articulation],
        distances: { ...low },
        ...partial,
      }),
      description
    );
  };

  snapshot('Find cut vertices: DFS tracking discovery and low-link times.', {});

  const dfs = (u: string, parent: string | null): void => {
    disc[u] = timer;
    low[u] = timer;
    timer += 1;
    visitedOrder.push(u);
    recorder.countAccess();
    snapshot(`Discover ${u} (disc ${disc[u]}).`, { current: u });
    let children = 0;
    for (const v of adjacency.get(u) ?? []) {
      if (v === parent) continue;
      recorder.countComparison();
      if (disc[v] !== undefined) {
        low[u] = Math.min(low[u], disc[v]);
      } else {
        children += 1;
        dfs(v, u);
        low[u] = Math.min(low[u], low[v]);
        if (parent !== null && low[v] >= disc[u]) {
          articulation.add(u);
          recorder.countSwap();
          snapshot(`low(${v})=${low[v]} ≥ disc(${u})=${disc[u]} → ${u} is a cut vertex.`, {
            current: u,
            activeEdge: [u, v],
          });
        }
      }
    }
    if (parent === null && children > 1) {
      articulation.add(u);
      recorder.countSwap();
      snapshot(`Root ${u} has ${children} DFS subtrees → cut vertex.`, {
        current: u,
      });
    }
    snapshot(`Back up from ${u} (low ${low[u]}).`, { current: u });
  };

  nodes.forEach((node) => {
    if (disc[node.id] === undefined) dfs(node.id, null);
  });

  snapshot(
    articulation.size > 0
      ? `Cut vertices (ringed): ${[...articulation].sort().join(', ')}.`
      : 'No articulation points — the graph stays connected on any single removal.',
    {}
  );
  return recorder.build();
};

export const articulationModule: AlgorithmModule<GraphState, GraphInput> = {
  id: 'articulation-points',
  name: 'Articulation Points',
  category: 'graph',
  tagline: 'Find the vertices whose removal would disconnect the graph.',
  accent: '#fb7185',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Edges explored',
    swaps: 'Cut vertices found',
    accesses: 'DFS visits',
  },
  info: {
    explanation:
      'An articulation point (cut vertex) is a node whose removal increases the number of connected components. A single DFS finds them all using discovery times and “low-link” values: the lowest discovery time reachable from a node’s subtree. A non-root u is a cut vertex if some child v cannot reach above u (low[v] ≥ disc[u]); the root is one if it has more than one DFS subtree.',
    complexity: {
      timeBest: 'O(V + E)',
      timeAverage: 'O(V + E)',
      timeWorst: 'O(V + E)',
      space: 'O(V)',
    },
    useCases: [
      'Network reliability / single points of failure',
      'Bridge and biconnected-component analysis',
      'Robustness of infrastructure graphs',
    ],
    realWorld: [
      'Critical routers/links in a network',
      'Power-grid and road-network resilience',
    ],
  },
  createDefaultInput: bridgeSample,
  generate,
};
