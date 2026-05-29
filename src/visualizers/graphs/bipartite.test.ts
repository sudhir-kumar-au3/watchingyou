import { describe, expect, it } from 'vitest';
import { bipartiteModule } from './bipartite';
import type { GraphInput } from './types';

const square: GraphInput = {
  start: 'A',
  nodes: [
    { id: 'A', x: 30, y: 30 },
    { id: 'B', x: 70, y: 30 },
    { id: 'C', x: 70, y: 70 },
    { id: 'D', x: 30, y: 70 },
  ],
  edges: [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' },
    { source: 'C', target: 'D' },
    { source: 'D', target: 'A' },
  ],
};

const triangle: GraphInput = {
  start: 'A',
  nodes: [
    { id: 'A', x: 50, y: 20 },
    { id: 'B', x: 25, y: 70 },
    { id: 'C', x: 75, y: 70 },
  ],
  edges: [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' },
    { source: 'C', target: 'A' },
  ],
};

const finalComponents = (input: GraphInput): Record<string, number> => {
  const frames = bipartiteModule.generate(input).frames;
  return frames[frames.length - 1].state.components ?? {};
};

const everyEdgeBichromatic = (input: GraphInput): boolean => {
  const colors = finalComponents(input);
  return input.edges.every((e) => colors[e.source] !== colors[e.target]);
};

describe('Bipartite check', () => {
  it('two-colours an even cycle with no monochromatic edge', () => {
    expect(everyEdgeBichromatic(square)).toBe(true);
  });

  it('detects an odd cycle as not bipartite', () => {
    expect(everyEdgeBichromatic(triangle)).toBe(false);
  });
});
