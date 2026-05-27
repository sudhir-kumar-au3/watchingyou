import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import {
  buildWeightedAdjacency,
  createGraphState,
  type GraphInput,
  type GraphState,
} from './types';

export type Heuristic = (nodeId: string) => number;

export const traceWeightedSearch = (
  input: GraphInput,
  heuristic: Heuristic
): Timeline<GraphState> => {
  const { nodes, edges, start } = input;
  const goal = input.goal ?? nodes[nodes.length - 1].id;
  const adjacency = buildWeightedAdjacency(nodes, edges);
  const recorder = new TimelineRecorder<GraphState>();

  const distance: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  nodes.forEach((node) => {
    distance[node.id] = Infinity;
    previous[node.id] = null;
  });
  distance[start] = 0;
  const visited = new Set<string>();

  const frontierIds = (): string[] =>
    nodes
      .filter((node) => !visited.has(node.id) && distance[node.id] < Infinity)
      .map((node) => node.id);

  const snapshot = (
    description: string,
    partial: Partial<GraphState>
  ): void => {
    recorder.capture(
      createGraphState(nodes, edges, {
        distances: { ...distance },
        goal,
        visited: [...visited],
        ...partial,
      }),
      description
    );
  };

  snapshot(`Initialise: distance to ${start} is 0, all others ∞.`, {
    frontier: [start],
  });

  while (true) {
    let chosen: string | null = null;
    let bestScore = Infinity;
    for (const node of nodes) {
      if (visited.has(node.id) || distance[node.id] === Infinity) continue;
      const score = distance[node.id] + heuristic(node.id);
      if (score < bestScore) {
        bestScore = score;
        chosen = node.id;
      }
    }
    if (chosen === null) break;

    recorder.countSwap();
    snapshot(`Settle ${chosen} with distance ${distance[chosen]}.`, {
      current: chosen,
      frontier: frontierIds(),
    });
    visited.add(chosen);
    if (chosen === goal) break;

    for (const { to, weight } of adjacency.get(chosen) ?? []) {
      if (visited.has(to)) continue;
      recorder.countComparison();
      const tentative = distance[chosen] + weight;
      const known = distance[to] === Infinity ? '∞' : distance[to];
      snapshot(
        `Relax ${chosen}→${to}: ${distance[chosen]} + ${weight} = ${tentative} (current ${known}).`,
        { current: chosen, activeEdge: [chosen, to], frontier: frontierIds() }
      );
      if (tentative < distance[to]) {
        distance[to] = tentative;
        previous[to] = chosen;
        recorder.countAccess();
        snapshot(`Improved distance to ${to}: ${tentative}.`, {
          current: chosen,
          activeEdge: [chosen, to],
          frontier: frontierIds(),
        });
      }
    }
  }

  const path: string[] = [];
  if (distance[goal] < Infinity) {
    let cursor: string | null = goal;
    while (cursor) {
      path.unshift(cursor);
      cursor = previous[cursor];
    }
  }

  recorder.capture(
    createGraphState(nodes, edges, {
      distances: { ...distance },
      goal,
      visited: [...visited],
      path,
    }),
    distance[goal] < Infinity
      ? `Shortest path ${start} → ${goal} costs ${distance[goal]}: ${path.join(' → ')}.`
      : `${goal} is unreachable from ${start}.`
  );

  return recorder.build();
};
