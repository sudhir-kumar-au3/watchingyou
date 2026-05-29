import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  buildAdjacency,
  createGraphState,
  type GraphInput,
  type GraphState,
} from './types';

const bipartiteSample = (): GraphInput => ({
  start: 'A',
  nodes: [
    { id: 'A', x: 20, y: 24 },
    { id: 'B', x: 50, y: 24 },
    { id: 'C', x: 80, y: 24 },
    { id: 'D', x: 20, y: 76 },
    { id: 'E', x: 50, y: 76 },
    { id: 'F', x: 80, y: 76 },
  ],
  edges: [
    { source: 'A', target: 'D' },
    { source: 'A', target: 'E' },
    { source: 'B', target: 'E' },
    { source: 'B', target: 'F' },
    { source: 'C', target: 'D' },
    { source: 'C', target: 'F' },
  ],
});

const SOURCE = `function isBipartite(graph) {
  const color = {};
  for (const s of graph.nodes) {
    if (color[s] !== undefined) continue;
    color[s] = 0; const queue = [s];
    while (queue.length) {
      const u = queue.shift();
      for (const v of graph.adj[u]) {
        if (color[v] === undefined) { color[v] = 1 - color[u]; queue.push(v); }
        else if (color[v] === color[u]) return false;   // same-colour edge
      }
    }
  }
  return true;
}`;

const generate = (input: GraphInput): Timeline<GraphState> => {
  const { nodes, edges, start } = input;
  const adjacency = buildAdjacency(nodes, edges);
  const recorder = new TimelineRecorder<GraphState>();
  const color: Record<string, number> = {};

  const snapshot = (description: string, partial: Partial<GraphState>): void => {
    recorder.capture(
      createGraphState(nodes, edges, { components: { ...color }, ...partial }),
      description
    );
  };

  snapshot('Two-colour the graph: adjacent nodes must differ.', {});

  const order = [start, ...nodes.map((node) => node.id)];
  let conflict = false;

  for (const source of order) {
    if (conflict || color[source] !== undefined) continue;
    color[source] = 0;
    const queue: string[] = [source];
    snapshot(`Colour ${source} with the first colour.`, { current: source });
    while (queue.length > 0 && !conflict) {
      const u = queue.shift() as string;
      for (const v of adjacency.get(u) ?? []) {
        recorder.countComparison();
        if (color[v] === undefined) {
          color[v] = 1 - color[u];
          recorder.countSwap();
          queue.push(v);
          snapshot(`Colour ${v} opposite to ${u}.`, {
            current: v,
            activeEdge: [u, v],
          });
        } else if (color[v] === color[u]) {
          conflict = true;
          snapshot(`${u} and ${v} share a colour — odd cycle, not bipartite.`, {
            activeEdge: [u, v],
            marked: [u, v],
          });
          break;
        }
      }
    }
  }

  snapshot(
    conflict
      ? 'Not bipartite — a same-colour edge exists.'
      : 'Bipartite — the two colours split the graph cleanly.',
    {}
  );
  return recorder.build();
};

export const bipartiteModule: AlgorithmModule<GraphState, GraphInput> = {
  id: 'bipartite',
  name: 'Bipartite Check',
  category: 'graph',
  tagline: 'Try to 2-colour the graph; a same-colour edge means an odd cycle.',
  accent: '#f472b6',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Edges checked',
    swaps: 'Nodes coloured',
    accesses: 'Lookups',
  },
  info: {
    explanation:
      'A graph is bipartite if its vertices split into two groups with every edge crossing between them — equivalently, it has no odd-length cycle. A BFS/DFS two-colouring tries to paint each node opposite to its neighbours; if it ever needs to give two adjacent nodes the same colour, the graph is not bipartite.',
    complexity: {
      timeBest: 'O(V + E)',
      timeAverage: 'O(V + E)',
      timeWorst: 'O(V + E)',
      space: 'O(V)',
    },
    useCases: [
      'Two-sided matching feasibility',
      'Conflict / scheduling graphs',
      'Detecting odd cycles',
    ],
    realWorld: [
      'Job ↔ machine assignment',
      'Stable-matching preprocessing',
    ],
  },
  createDefaultInput: bipartiteSample,
  generate,
};
