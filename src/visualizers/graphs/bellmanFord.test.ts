import { describe, expect, it } from 'vitest';
import { bellmanFordModule } from './bellmanFord';
import { weightedSampleGraph } from './types';

const reference = (input: ReturnType<typeof weightedSampleGraph>) => {
  const dist: Record<string, number> = {};
  input.nodes.forEach((n) => (dist[n.id] = Infinity));
  dist[input.start] = 0;
  for (let pass = 1; pass < input.nodes.length; pass += 1) {
    input.edges.forEach((e) => {
      const w = e.weight ?? 1;
      if (dist[e.source] + w < dist[e.target]) dist[e.target] = dist[e.source] + w;
      if (dist[e.target] + w < dist[e.source]) dist[e.source] = dist[e.target] + w;
    });
  }
  return dist;
};

describe('Bellman-Ford', () => {
  it('computes shortest distances matching a reference', () => {
    const input = weightedSampleGraph();
    const frames = bellmanFordModule.generate(input).frames;
    const finalDist = frames[frames.length - 1].state.distances;
    const ref = reference(input);
    input.nodes.forEach((n) => expect(finalDist[n.id]).toBe(ref[n.id]));
  });

  it('keeps the source at distance 0', () => {
    const input = weightedSampleGraph();
    const frames = bellmanFordModule.generate(input).frames;
    expect(frames[frames.length - 1].state.distances[input.start]).toBe(0);
  });
});
