import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  buildAdjacency,
  createGraphState,
  sampleGraph,
  type GraphInput,
  type GraphState,
} from './types';

const SOURCE = `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const next of graph[node]) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return order;
}`;

const generate = (input: GraphInput): Timeline<GraphState> => {
  const recorder = new TimelineRecorder<GraphState>();
  const { nodes, edges, start } = input;
  const adjacency = buildAdjacency(nodes, edges);

  const visited = new Set<string>([start]);
  const queue: string[] = [start];
  const order: string[] = [];

  recorder.capture(
    createGraphState(nodes, edges, { frontier: [start] }),
    `Enqueue start node ${start}.`,
    [3]
  );

  while (queue.length > 0) {
    const node = queue.shift() as string;
    order.push(node);
    recorder.countAccess();
    recorder.capture(
      createGraphState(nodes, edges, {
        visited: [...visited],
        frontier: [...queue],
        current: node,
        order: [...order],
      }),
      `Dequeue ${node} and visit it.`,
      [6]
    );

    for (const next of adjacency.get(node) ?? []) {
      recorder.countComparison();
      recorder.capture(
        createGraphState(nodes, edges, {
          visited: [...visited],
          frontier: [...queue],
          current: node,
          activeEdge: [node, next],
          order: [...order],
        }),
        visited.has(next)
          ? `${next} already visited — skip.`
          : `Discover ${next} via ${node}.`,
        [8]
      );
      if (!visited.has(next)) {
        recorder.countSwap();
        visited.add(next);
        queue.push(next);
        recorder.capture(
          createGraphState(nodes, edges, {
            visited: [...visited],
            frontier: [...queue],
            current: node,
            order: [...order],
          }),
          `Enqueue ${next}.`,
          [11]
        );
      }
    }
  }

  recorder.capture(
    createGraphState(nodes, edges, {
      visited: [...visited],
      order: [...order],
    }),
    `Traversal complete: ${order.join(' → ')}.`,
    [15]
  );

  return recorder.build();
};

export const bfsModule: AlgorithmModule<GraphState, GraphInput> = {
  id: 'bfs',
  name: 'Breadth-First Search',
  category: 'graph',
  tagline: 'Explore level by level using a queue.',
  accent: '#22d3ee',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Edges checked',
    swaps: 'Enqueues',
    accesses: 'Nodes visited',
  },
  info: {
    explanation:
      'Breadth-first search explores a graph in expanding rings from the start node. It uses a FIFO queue, so every node at distance k is visited before any node at distance k+1 — which is why BFS finds shortest paths in unweighted graphs.',
    complexity: {
      timeBest: 'O(V + E)',
      timeAverage: 'O(V + E)',
      timeWorst: 'O(V + E)',
      space: 'O(V)',
    },
    useCases: [
      'Shortest paths in unweighted graphs',
      'Finding connected components',
      'Level-order traversal of trees',
    ],
    realWorld: [
      'Social network "degrees of separation"',
      'Web crawlers exploring links breadth-first',
    ],
  },
  createDefaultInput: sampleGraph,
  generate,
};
