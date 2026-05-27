import type { AlgorithmModule } from '@/core/engine/types';
import { traceWeightedSearch } from './weightedSearch';
import { weightedSampleGraph, type GraphInput, type GraphState } from './types';

const SOURCE = `function dijkstra(graph, start) {
  const dist = {};
  for (const node of graph.nodes) dist[node] = Infinity;
  dist[start] = 0;
  const visited = new Set();
  while (visited.size < graph.nodes.length) {
    const u = closestUnvisited(dist, visited);
    if (u == null) break;
    visited.add(u);
    for (const { to, weight } of graph.edges[u]) {
      if (dist[u] + weight < dist[to]) {
        dist[to] = dist[u] + weight;
        prev[to] = u;
      }
    }
  }
  return dist;
}`;

export const dijkstraModule: AlgorithmModule<GraphState, GraphInput> = {
  id: 'dijkstra',
  name: "Dijkstra's Algorithm",
  category: 'graph',
  tagline: 'Greedily settle the closest node to find shortest paths.',
  accent: '#34d399',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Edges relaxed',
    swaps: 'Nodes settled',
    accesses: 'Distance updates',
  },
  info: {
    explanation:
      'Dijkstra’s algorithm finds shortest paths from a start node in a graph with non-negative edge weights. It repeatedly settles the unvisited node with the smallest tentative distance, then relaxes its outgoing edges — guaranteeing each settled distance is final.',
    complexity: {
      timeBest: 'O(E + V log V)',
      timeAverage: 'O(E + V log V)',
      timeWorst: 'O(E + V log V)',
      space: 'O(V)',
    },
    useCases: [
      'Shortest routes in weighted graphs',
      'Network routing protocols',
      'Least-cost pathfinding without a heuristic',
    ],
    realWorld: [
      'GPS navigation and mapping services',
      'Packet routing across the internet',
    ],
  },
  createDefaultInput: weightedSampleGraph,
  generate: (input) => traceWeightedSearch(input, () => 0),
};
