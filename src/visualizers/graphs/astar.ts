import type { AlgorithmModule } from '@/core/engine/types';
import { traceWeightedSearch, type Heuristic } from './weightedSearch';
import { weightedSampleGraph, type GraphInput, type GraphState } from './types';

const SOURCE = `function aStar(graph, start, goal) {
  const g = { [start]: 0 };
  const open = new MinHeap((n) => g[n] + h(n, goal));
  open.push(start);
  while (!open.isEmpty()) {
    const u = open.pop();
    if (u === goal) break;
    for (const { to, weight } of graph.edges[u]) {
      const tentative = g[u] + weight;
      if (tentative < (g[to] ?? Infinity)) {
        g[to] = tentative;
        prev[to] = u;
        open.push(to);
      }
    }
  }
  return reconstruct(prev, goal);
}`;

const buildHeuristic = (input: GraphInput): Heuristic => {
  const goalId = input.goal ?? input.nodes[input.nodes.length - 1].id;
  const positions = new Map(input.nodes.map((node) => [node.id, node]));
  const goal = positions.get(goalId);

  let ratio = Infinity;
  for (const edge of input.edges) {
    const a = positions.get(edge.source);
    const b = positions.get(edge.target);
    if (!a || !b) continue;
    const span = Math.hypot(a.x - b.x, a.y - b.y);
    if (span > 0) ratio = Math.min(ratio, (edge.weight ?? 1) / span);
  }
  if (!Number.isFinite(ratio)) ratio = 0;

  return (nodeId) => {
    const node = positions.get(nodeId);
    if (!node || !goal) return 0;
    return Math.hypot(node.x - goal.x, node.y - goal.y) * ratio;
  };
};

export const astarModule: AlgorithmModule<GraphState, GraphInput> = {
  id: 'astar',
  name: 'A* Search',
  category: 'graph',
  tagline: 'Dijkstra guided by a heuristic toward the goal.',
  accent: '#a855f7',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Edges relaxed',
    swaps: 'Nodes settled',
    accesses: 'Distance updates',
  },
  info: {
    explanation:
      'A* search extends Dijkstra by ordering nodes on f(n) = g(n) + h(n): the cost so far plus an admissible estimate of the remaining cost to the goal. With a heuristic that never overestimates, A* finds the optimal path while exploring far fewer nodes than Dijkstra.',
    complexity: {
      timeBest: 'O(E)',
      timeAverage: 'O(E log V)',
      timeWorst: 'O(E + V log V)',
      space: 'O(V)',
    },
    useCases: [
      'Goal-directed shortest paths',
      'Game and robotics pathfinding',
      'Any search with a good distance estimate',
    ],
    realWorld: [
      'Pathfinding in video games',
      'Route planning with travel-time estimates',
    ],
  },
  createDefaultInput: weightedSampleGraph,
  generate: (input) => traceWeightedSearch(input, buildHeuristic(input)),
};
