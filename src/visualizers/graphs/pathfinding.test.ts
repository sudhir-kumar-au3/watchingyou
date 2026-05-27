import { describe, expect, it } from 'vitest';
import { dijkstraModule } from './dijkstra';
import { astarModule } from './astar';
import { weightedSampleGraph } from './types';

const finalState = (
  generate: typeof dijkstraModule.generate,
  input = weightedSampleGraph()
) => {
  const frames = generate(input).frames;
  return frames[frames.length - 1].state;
};

describe('Dijkstra', () => {
  it('computes the shortest distance to the goal', () => {
    const state = finalState(dijkstraModule.generate);
    expect(state.distances.H).toBe(9);
  });

  it('reconstructs the shortest path', () => {
    const state = finalState(dijkstraModule.generate);
    expect(state.path).toEqual(['A', 'B', 'E', 'F', 'H']);
  });

  it('settles every node with a finite distance', () => {
    const state = finalState(dijkstraModule.generate);
    expect(state.distances.A).toBe(0);
    expect(state.distances.F).toBe(7);
    expect(Object.keys(state.distances).length).toBe(8);
  });
});

describe('A*', () => {
  it('finds the same optimal distance with an admissible heuristic', () => {
    const state = finalState(astarModule.generate);
    expect(state.distances.H).toBe(9);
  });

  it('reconstructs the shortest path to the goal', () => {
    const state = finalState(astarModule.generate);
    expect(state.path).toEqual(['A', 'B', 'E', 'F', 'H']);
  });
});
