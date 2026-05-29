import { describe, expect, it } from 'vitest';
import { floydWarshallModule } from './floydWarshall';

const INF = Infinity;

const reference = (n: number, edges: { from: number; to: number; weight: number }[]) => {
  const d = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : INF))
  );
  edges.forEach(({ from, to, weight }) => {
    d[from][to] = Math.min(d[from][to], weight);
  });
  for (let k = 0; k < n; k += 1)
    for (let i = 0; i < n; i += 1)
      for (let j = 0; j < n; j += 1)
        if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
  return d;
};

describe('Floyd-Warshall', () => {
  it('computes correct all-pairs shortest distances', () => {
    const input = floydWarshallModule.createDefaultInput();
    const frames = floydWarshallModule.generate(input).frames;
    const finalDist = frames[frames.length - 1].state.dist;
    expect(finalDist).toEqual(reference(input.labels.length, input.edges));
  });

  it('keeps every diagonal distance at zero', () => {
    const input = floydWarshallModule.createDefaultInput();
    const frames = floydWarshallModule.generate(input).frames;
    const dist = frames[frames.length - 1].state.dist;
    dist.forEach((row, i) => expect(row[i]).toBe(0));
  });

  it('relaxes a multi-hop shortcut below its direct edge', () => {
    const input = floydWarshallModule.createDefaultInput();
    const frames = floydWarshallModule.generate(input).frames;
    const dist = frames[frames.length - 1].state.dist;
    // A->D should beat the direct edge of 9 via A->B->C->D
    expect(dist[0][3]).toBe(6);
  });
});
