import { describe, expect, it } from 'vitest';
import { articulationModule } from './articulation';
import type { GraphInput } from './types';

const pendant: GraphInput = {
  start: 'A',
  nodes: [
    { id: 'A', x: 15, y: 50 },
    { id: 'B', x: 40, y: 50 },
    { id: 'C', x: 65, y: 30 },
    { id: 'D', x: 65, y: 70 },
  ],
  edges: [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' },
    { source: 'C', target: 'D' },
    { source: 'B', target: 'D' },
  ],
};

const finalMarked = (input: GraphInput): string[] => {
  const frames = articulationModule.generate(input).frames;
  return (frames[frames.length - 1].state.marked ?? []).sort();
};

describe('Articulation points', () => {
  it('flags the cut vertex that isolates a pendant', () => {
    expect(finalMarked(pendant)).toEqual(['B']);
  });

  it('finds no articulation point in a simple cycle', () => {
    const cycle: GraphInput = {
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
    expect(finalMarked(cycle)).toEqual([]);
  });
});
