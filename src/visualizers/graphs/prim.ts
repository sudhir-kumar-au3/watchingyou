import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  createGraphState,
  weightedSampleGraph,
  type GraphInput,
  type GraphState,
} from './types';

const SOURCE = `function prim(graph, start) {
  const inTree = new Set([start]);
  const mst = [];
  while (inTree.size < graph.nodes.length) {
    let best = null;
    for (const e of graph.edges) {
      const crosses = inTree.has(e.u) !== inTree.has(e.v);
      if (crosses && (!best || e.w < best.w)) best = e;
    }
    if (!best) break;
    inTree.add(inTree.has(best.u) ? best.v : best.u);
    mst.push(best);
  }
  return mst;
}`;

const generate = (input: GraphInput): Timeline<GraphState> => {
  const { nodes, edges, start } = input;
  const recorder = new TimelineRecorder<GraphState>();
  const inTree = new Set<string>([start]);
  const treeEdges: [string, string][] = [];

  const snapshot = (description: string, partial: Partial<GraphState>): void => {
    recorder.capture(
      createGraphState(nodes, edges, {
        treeEdges: treeEdges.map(([u, v]) => [u, v]),
        visited: [...inTree],
        ...partial,
      }),
      description
    );
  };

  snapshot(`Grow a minimum spanning tree from ${start}.`, { current: start });

  while (inTree.size < nodes.length) {
    let best: { source: string; target: string; weight: number } | null = null;
    for (const edge of edges) {
      const inU = inTree.has(edge.source);
      const inV = inTree.has(edge.target);
      if (inU === inV) continue;
      recorder.countComparison();
      const weight = edge.weight ?? 1;
      if (!best || weight < best.weight) {
        best = { source: edge.source, target: edge.target, weight };
      }
    }
    if (!best) break;

    const added = inTree.has(best.source) ? best.target : best.source;
    snapshot(
      `Cheapest crossing edge is ${best.source}–${best.target} (${best.weight}).`,
      { activeEdge: [best.source, best.target], current: added }
    );
    inTree.add(added);
    treeEdges.push([best.source, best.target]);
    recorder.countSwap();
    snapshot(`Add ${added} to the tree.`, { current: added });
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

export const primModule: AlgorithmModule<GraphState, GraphInput> = {
  id: 'prim',
  name: "Prim's MST",
  category: 'graph',
  tagline: 'Grow a minimum spanning tree one cheapest edge at a time.',
  accent: '#34d399',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Edges examined',
    swaps: 'Nodes added',
    accesses: 'Lookups',
  },
  info: {
    explanation:
      "Prim's algorithm builds a minimum spanning tree by starting from one node and repeatedly adding the cheapest edge that connects the tree to a new node. It always keeps a single growing tree, much like Dijkstra but minimising edge weight rather than path distance.",
    complexity: {
      timeBest: 'O(E + V log V)',
      timeAverage: 'O(E + V log V)',
      timeWorst: 'O(E + V log V)',
      space: 'O(V)',
    },
    useCases: [
      'Minimum-cost network design',
      'Clustering and approximation',
      'Dense graphs (grows from a node)',
    ],
    realWorld: [
      'Laying cable or pipelines at least cost',
      'Designing electrical grids',
    ],
  },
  createDefaultInput: weightedSampleGraph,
  generate,
};
