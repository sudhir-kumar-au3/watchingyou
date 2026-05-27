import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  createGraphState,
  weightedSampleGraph,
  type GraphInput,
  type GraphState,
} from './types';

const SOURCE = `function kruskal(graph) {
  const edges = [...graph.edges].sort((a, b) => a.w - b.w);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const mst = [];
  for (const e of edges) {
    const ru = find(e.u), rv = find(e.v);
    if (ru !== rv) {
      parent[ru] = rv;
      mst.push(e);
    }
  }
  return mst;
}`;

const generate = (input: GraphInput): Timeline<GraphState> => {
  const { nodes, edges } = input;
  const recorder = new TimelineRecorder<GraphState>();

  const parent: Record<string, string> = {};
  nodes.forEach((node) => (parent[node.id] = node.id));
  const find = (x: string): string =>
    parent[x] === x ? x : (parent[x] = find(parent[x]));

  const sorted = [...edges].sort(
    (a, b) => (a.weight ?? 1) - (b.weight ?? 1)
  );
  const treeEdges: [string, string][] = [];
  const connected = new Set<string>();

  const snapshot = (description: string, partial: Partial<GraphState>): void => {
    recorder.capture(
      createGraphState(nodes, edges, {
        treeEdges: treeEdges.map(([u, v]) => [u, v]),
        visited: [...connected],
        ...partial,
      }),
      description
    );
  };

  snapshot('Sort edges by weight, then add each if it joins two components.', {});

  for (const edge of sorted) {
    recorder.countComparison();
    const ru = find(edge.source);
    const rv = find(edge.target);
    const weight = edge.weight ?? 1;
    if (ru !== rv) {
      parent[ru] = rv;
      treeEdges.push([edge.source, edge.target]);
      connected.add(edge.source);
      connected.add(edge.target);
      recorder.countSwap();
      snapshot(
        `Edge ${edge.source}–${edge.target} (${weight}): joins two components — keep it.`,
        { activeEdge: [edge.source, edge.target] }
      );
    } else {
      snapshot(
        `Edge ${edge.source}–${edge.target} (${weight}): would form a cycle — skip.`,
        { activeEdge: [edge.source, edge.target] }
      );
    }
  }

  const total = treeEdges.reduce((sum, [u, v]) => {
    const edge = edges.find(
      (e) =>
        (e.source === u && e.target === v) || (e.source === v && e.target === u)
    );
    return sum + (edge?.weight ?? 0);
  }, 0);

  snapshot(`Minimum spanning tree complete — total weight ${total}.`, {});
  return recorder.build();
};

export const kruskalModule: AlgorithmModule<GraphState, GraphInput> = {
  id: 'kruskal',
  name: "Kruskal's MST",
  category: 'graph',
  tagline: 'Add the globally cheapest edges, skipping any that form a cycle.',
  accent: '#818cf8',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Edges considered',
    swaps: 'Edges kept',
    accesses: 'Unions',
  },
  info: {
    explanation:
      "Kruskal's algorithm sorts all edges by weight and adds them cheapest-first, using a union-find structure to skip any edge whose endpoints are already connected (which would create a cycle). The kept edges form a minimum spanning tree.",
    complexity: {
      timeBest: 'O(E log E)',
      timeAverage: 'O(E log E)',
      timeWorst: 'O(E log E)',
      space: 'O(V)',
    },
    useCases: [
      'Minimum spanning trees on sparse graphs',
      'Clustering via single-linkage',
      'Network and circuit design',
    ],
    realWorld: [
      'Connecting cities with least total road length',
      'Image segmentation',
    ],
  },
  createDefaultInput: weightedSampleGraph,
  generate,
};
