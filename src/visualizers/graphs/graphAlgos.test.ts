import { describe, expect, it } from 'vitest';
import { topologicalModule } from './topological';
import { primModule } from './prim';
import { kruskalModule } from './kruskal';
import { dagSample, weightedSampleGraph, type GraphState } from './types';

const lastState = (
  generate: (input: ReturnType<typeof weightedSampleGraph>) => {
    frames: { state: GraphState }[];
  },
  input: ReturnType<typeof weightedSampleGraph>
): GraphState => {
  const frames = generate(input).frames;
  return frames[frames.length - 1].state;
};

const mstWeight = (state: GraphState): number => {
  const weightOf = new Map(
    state.edges.map((e) => [[e.source, e.target].sort().join('~'), e.weight ?? 0])
  );
  return state.treeEdges.reduce(
    (sum, [u, v]) => sum + (weightOf.get([u, v].sort().join('~')) ?? 0),
    0
  );
};

describe('Topological sort', () => {
  it('produces a valid ordering (every edge points forward)', () => {
    const input = dagSample();
    const state = lastState(topologicalModule.generate, input);
    const pos = new Map(state.order.map((id, i) => [id, i]));
    expect(state.order.length).toBe(input.nodes.length);
    for (const edge of input.edges) {
      expect(pos.get(edge.source)!).toBeLessThan(pos.get(edge.target)!);
    }
  });
});

describe('Prim MST', () => {
  it('builds a spanning tree of minimum weight', () => {
    const state = lastState(primModule.generate, weightedSampleGraph());
    expect(state.treeEdges.length).toBe(7);
    expect(mstWeight(state)).toBe(19);
  });
});

describe('Kruskal MST', () => {
  it('builds a spanning tree of minimum weight', () => {
    const state = lastState(kruskalModule.generate, weightedSampleGraph());
    expect(state.treeEdges.length).toBe(7);
    expect(mstWeight(state)).toBe(19);
  });

  it('starts with every node in its own singleton set', () => {
    const first = kruskalModule.generate(weightedSampleGraph()).frames[0].state;
    const values = Object.values(first.components ?? {});
    expect(values.length).toBe(weightedSampleGraph().nodes.length);
    expect(values.every((v) => v === -1)).toBe(true);
  });

  it('merges every node into one component by the end', () => {
    const state = lastState(kruskalModule.generate, weightedSampleGraph());
    const colors = new Set(Object.values(state.components ?? {}));
    expect(colors.size).toBe(1);
    expect([...colors][0]).toBeGreaterThanOrEqual(0);
  });
});
