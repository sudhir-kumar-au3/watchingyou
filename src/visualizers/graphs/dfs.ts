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

const SOURCE = `function dfs(graph, start) {
  const visited = new Set();
  const order = [];
  function explore(node) {
    visited.add(node);
    order.push(node);
    for (const next of graph[node]) {
      if (!visited.has(next)) explore(next);
    }
  }
  explore(start);
  return order;
}`;

const generate = (input: GraphInput): Timeline<GraphState> => {
  const recorder = new TimelineRecorder<GraphState>();
  const { nodes, edges, start } = input;
  const adjacency = buildAdjacency(nodes, edges);

  const visited = new Set<string>();
  const order: string[] = [];
  const stack: string[] = [];

  recorder.capture(
    createGraphState(nodes, edges, { frontier: [start] }),
    `Begin depth-first search at ${start}.`,
    [10]
  );

  const explore = (node: string): void => {
    visited.add(node);
    order.push(node);
    stack.push(node);
    recorder.countAccess();
    recorder.capture(
      createGraphState(nodes, edges, {
        visited: [...visited],
        frontier: [...stack],
        current: node,
        order: [...order],
      }),
      `Visit ${node} and dive deeper.`,
      [5]
    );

    for (const next of adjacency.get(node) ?? []) {
      recorder.countComparison();
      recorder.capture(
        createGraphState(nodes, edges, {
          visited: [...visited],
          frontier: [...stack],
          current: node,
          activeEdge: [node, next],
          order: [...order],
        }),
        visited.has(next)
          ? `${next} already visited — backtrack.`
          : `Descend into ${next}.`,
        [7]
      );
      if (!visited.has(next)) {
        recorder.countSwap();
        explore(next);
        recorder.capture(
          createGraphState(nodes, edges, {
            visited: [...visited],
            frontier: [...stack],
            current: node,
            order: [...order],
          }),
          `Return to ${node}.`,
          [8]
        );
      }
    }
    stack.pop();
  };

  explore(start);

  recorder.capture(
    createGraphState(nodes, edges, {
      visited: [...visited],
      order: [...order],
    }),
    `Traversal complete: ${order.join(' → ')}.`,
    [12]
  );

  return recorder.build();
};

export const dfsModule: AlgorithmModule<GraphState, GraphInput> = {
  id: 'dfs',
  name: 'Depth-First Search',
  category: 'graph',
  tagline: 'Plunge as deep as possible, then backtrack.',
  accent: '#a855f7',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Edges checked',
    swaps: 'Recursions',
    accesses: 'Nodes visited',
  },
  info: {
    explanation:
      'Depth-first search follows one path as far as it can before backtracking to the most recent unexplored branch. It is naturally recursive (an implicit stack) and underpins cycle detection, topological sorting, and connectivity checks.',
    complexity: {
      timeBest: 'O(V + E)',
      timeAverage: 'O(V + E)',
      timeWorst: 'O(V + E)',
      space: 'O(V)',
    },
    useCases: [
      'Cycle detection and topological sort',
      'Finding connected components',
      'Maze and puzzle solving via backtracking',
    ],
    realWorld: [
      'Dependency resolution in build systems',
      'Garbage collectors marking reachable objects',
    ],
  },
  createDefaultInput: sampleGraph,
  generate,
};
