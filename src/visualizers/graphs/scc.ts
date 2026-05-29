import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  createGraphState,
  sccSample,
  type GraphInput,
  type GraphState,
} from './types';

const SOURCE = `function kosaraju(graph) {
  const order = [];
  dfs1(graph, order);              // push by finish time
  const gt = transpose(graph);     // reverse every edge
  let comp = 0; const id = {};
  for (const u of order.reverse())
    if (id[u] === undefined) { dfs2(gt, u, comp, id); comp++; }
  return id;                       // node -> component
}`;

const generate = (input: GraphInput): Timeline<GraphState> => {
  const { nodes, edges } = input;
  const forward = new Map<string, string[]>();
  const reverse = new Map<string, string[]>();
  nodes.forEach((node) => {
    forward.set(node.id, []);
    reverse.set(node.id, []);
  });
  edges.forEach(({ source, target }) => {
    forward.get(source)?.push(target);
    reverse.get(target)?.push(source);
  });
  forward.forEach((list) => list.sort());
  reverse.forEach((list) => list.sort());

  const recorder = new TimelineRecorder<GraphState>();
  const comp: Record<string, number> = {};
  const visitedOrder: string[] = [];

  const snapshot = (description: string, partial: Partial<GraphState>): void => {
    recorder.capture(
      createGraphState(nodes, edges, {
        directed: true,
        components: { ...comp },
        visited: [...visitedOrder],
        ...partial,
      }),
      description
    );
  };

  snapshot('Pass 1 — DFS the graph and record finish order.', {});

  const seen1 = new Set<string>();
  const order: string[] = [];
  const dfs1 = (u: string): void => {
    seen1.add(u);
    visitedOrder.push(u);
    recorder.countAccess();
    snapshot(`Visit ${u}.`, { current: u });
    for (const v of forward.get(u) ?? []) {
      recorder.countComparison();
      if (!seen1.has(v)) dfs1(v);
    }
    order.push(u);
  };
  nodes.forEach((node) => {
    if (!seen1.has(node.id)) dfs1(node.id);
  });

  snapshot('Reverse every edge, then DFS in reverse finish order.', {
    directed: true,
  });

  visitedOrder.length = 0;
  const seen2 = new Set<string>();
  let label = 0;
  const dfs2 = (u: string, id: number): void => {
    seen2.add(u);
    comp[u] = id;
    recorder.countSwap();
    snapshot(`Component ${id}: add ${u}.`, { current: u });
    for (const v of reverse.get(u) ?? []) {
      recorder.countComparison();
      if (!seen2.has(v)) dfs2(v, id);
    }
  };
  for (let k = order.length - 1; k >= 0; k -= 1) {
    const u = order[k];
    if (!seen2.has(u)) {
      dfs2(u, label);
      label += 1;
    }
  }

  snapshot(`Found ${label} strongly connected component${label === 1 ? '' : 's'}.`, {});
  return recorder.build();
};

export const sccModule: AlgorithmModule<GraphState, GraphInput> = {
  id: 'scc',
  name: 'Strongly Connected Components',
  category: 'graph',
  tagline: "Kosaraju's two passes group nodes that can all reach each other.",
  accent: '#818cf8',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Edges followed',
    swaps: 'Nodes assigned',
    accesses: 'DFS visits',
  },
  info: {
    explanation:
      'In a directed graph, a strongly connected component is a maximal set of vertices where every one can reach every other. Kosaraju’s algorithm runs two DFS passes: the first records vertices by finish time; then, on the edge-reversed graph, popping vertices in reverse finish order and flooding from each unvisited one carves out exactly one component per flood.',
    complexity: {
      timeBest: 'O(V + E)',
      timeAverage: 'O(V + E)',
      timeWorst: 'O(V + E)',
      space: 'O(V)',
    },
    useCases: [
      'Condensing a digraph into a DAG of components',
      'Detecting cycles / mutual reachability',
      '2-SAT and dependency analysis',
    ],
    realWorld: [
      'Module/package dependency cycles',
      'Dead-code and call-graph analysis',
    ],
  },
  createDefaultInput: sccSample,
  generate,
};
