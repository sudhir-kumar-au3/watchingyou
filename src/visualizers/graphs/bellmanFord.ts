import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  createGraphState,
  weightedSampleGraph,
  type GraphInput,
  type GraphState,
} from './types';

const SOURCE = `function bellmanFord(graph, start) {
  const dist = {}; for (const v of graph.nodes) dist[v] = Infinity;
  dist[start] = 0;
  for (let pass = 1; pass < graph.nodes.length; pass++)
    for (const { u, v, w } of graph.edges)
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;   // relax
  return dist;                                            // handles negatives
}`;

const generate = (input: GraphInput): Timeline<GraphState> => {
  const { nodes, edges, start, goal } = input;
  const recorder = new TimelineRecorder<GraphState>();
  const dist: Record<string, number> = {};
  const parent: Record<string, string> = {};
  nodes.forEach((node) => (dist[node.id] = Infinity));
  dist[start] = 0;

  const snapshot = (description: string, partial: Partial<GraphState>): void => {
    recorder.capture(
      createGraphState(nodes, edges, {
        distances: { ...dist },
        goal: goal ?? null,
        ...partial,
      }),
      description
    );
  };

  snapshot(`Distance to ${start} is 0; everything else starts at ∞.`, {
    current: start,
  });

  const relax = (u: string, v: string, w: number): boolean => {
    recorder.countComparison();
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      dist[v] = dist[u] + w;
      parent[v] = u;
      recorder.countSwap();
      snapshot(`Relax ${u}→${v}: distance to ${v} drops to ${dist[v]}.`, {
        activeEdge: [u, v],
        current: v,
      });
      return true;
    }
    return false;
  };

  const passes = nodes.length - 1;
  for (let pass = 1; pass <= passes; pass += 1) {
    snapshot(`Relaxation pass ${pass} of ${passes} — try every edge.`, {});
    let changed = false;
    for (const edge of edges) {
      const w = edge.weight ?? 1;
      if (relax(edge.source, edge.target, w)) changed = true;
      if (relax(edge.target, edge.source, w)) changed = true;
    }
    if (!changed) {
      snapshot('No distance changed this pass — distances are final.', {});
      break;
    }
  }

  const path: string[] = [];
  if (goal && dist[goal] !== Infinity) {
    let cursor: string | undefined = goal;
    while (cursor !== undefined) {
      path.unshift(cursor);
      cursor = parent[cursor];
    }
  }

  snapshot(`Shortest distances from ${start} are settled.`, { path });
  return recorder.build();
};

export const bellmanFordModule: AlgorithmModule<GraphState, GraphInput> = {
  id: 'bellman-ford',
  name: 'Bellman-Ford',
  category: 'graph',
  tagline: 'Shortest paths by relaxing every edge V−1 times — negatives welcome.',
  accent: '#34d399',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Edge relaxations',
    swaps: 'Distance updates',
    accesses: 'Lookups',
  },
  info: {
    explanation:
      'Bellman-Ford finds single-source shortest paths by brute relaxation: repeat “for every edge, can we reach its endpoint more cheaply?” V−1 times. Because the longest shortest path uses at most V−1 edges, that many passes guarantee convergence. Unlike Dijkstra it tolerates negative edge weights (and a final pass can detect negative cycles).',
    complexity: {
      timeBest: 'O(E)',
      timeAverage: 'O(V·E)',
      timeWorst: 'O(V·E)',
      space: 'O(V)',
    },
    useCases: [
      'Shortest paths with negative weights',
      'Negative-cycle detection',
      'Distance-vector routing',
    ],
    realWorld: [
      'RIP routing protocol',
      'Currency arbitrage detection',
    ],
  },
  createDefaultInput: weightedSampleGraph,
  generate,
};
