import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  buildAdjacency,
  createGraphState,
  dagSample,
  type GraphInput,
  type GraphState,
} from './types';

const SOURCE = `function topoSort(graph) {
  const indeg = {};
  for (const v of graph.nodes) indeg[v] = 0;
  for (const [u, v] of graph.edges) indeg[v]++;
  const queue = graph.nodes.filter((v) => indeg[v] === 0);
  const order = [];
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    for (const v of graph.adj[u]) {
      if (--indeg[v] === 0) queue.push(v);
    }
  }
  return order;
}`;

const generate = (input: GraphInput): Timeline<GraphState> => {
  const { nodes, edges } = input;
  const adjacency = buildAdjacency(nodes, edges, true);
  const recorder = new TimelineRecorder<GraphState>();

  const indegree: Record<string, number> = {};
  nodes.forEach((node) => (indegree[node.id] = 0));
  edges.forEach((edge) => (indegree[edge.target] += 1));

  const order: string[] = [];
  const queue = nodes.filter((node) => indegree[node.id] === 0).map((n) => n.id);

  const snapshot = (description: string, partial: Partial<GraphState>): void => {
    recorder.capture(
      createGraphState(nodes, edges, {
        directed: true,
        distances: { ...indegree },
        order: [...order],
        ...partial,
      }),
      description
    );
  };

  snapshot('Start with every node of in-degree 0.', { frontier: [...queue] });

  const visited = new Set<string>();
  while (queue.length > 0) {
    const node = queue.shift() as string;
    order.push(node);
    visited.add(node);
    recorder.countSwap();
    snapshot(`Output ${node} — no remaining prerequisites.`, {
      current: node,
      visited: [...visited],
      frontier: [...queue],
    });

    for (const next of adjacency.get(node) ?? []) {
      recorder.countComparison();
      indegree[next] -= 1;
      snapshot(
        `Edge ${node}→${next}: in-degree of ${next} now ${indegree[next]}.`,
        {
          current: node,
          visited: [...visited],
          activeEdge: [node, next],
          frontier: [...queue],
        }
      );
      if (indegree[next] === 0) {
        queue.push(next);
        snapshot(`${next} is now free — enqueue it.`, {
          current: node,
          visited: [...visited],
          frontier: [...queue],
        });
      }
    }
  }

  snapshot(`Topological order: ${order.join(' → ')}.`, {
    visited: [...visited],
  });

  return recorder.build();
};

export const topologicalModule: AlgorithmModule<GraphState, GraphInput> = {
  id: 'topological-sort',
  name: 'Topological Sort',
  category: 'graph',
  tagline: 'Order a dependency graph so every edge points forward.',
  accent: '#fbbf24',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Edges removed',
    swaps: 'Nodes output',
    accesses: 'Lookups',
  },
  info: {
    explanation:
      "Topological sort linearises a directed acyclic graph so that every edge u→v has u before v. Kahn's algorithm repeatedly outputs a node with no remaining incoming edges, then removes its outgoing edges, freeing the next layer of nodes.",
    complexity: {
      timeBest: 'O(V + E)',
      timeAverage: 'O(V + E)',
      timeWorst: 'O(V + E)',
      space: 'O(V)',
    },
    useCases: [
      'Build systems and task scheduling',
      'Course prerequisite ordering',
      'Resolving dependency graphs',
    ],
    realWorld: [
      'Package managers resolving install order',
      'Spreadsheet formula recalculation',
    ],
  },
  createDefaultInput: dagSample,
  generate,
};
