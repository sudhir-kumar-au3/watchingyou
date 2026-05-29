import { describe, expect, it } from 'vitest';
import { mazeModule, type MazeInput } from './maze';

const fixture: MazeInput = {
  rows: 4,
  cols: 4,
  grid: [
    [0, 0, 0, 0],
    [1, 1, 0, 1],
    [0, 0, 0, 0],
    [0, 1, 1, 0],
  ],
  start: [0, 0],
  goal: [3, 3],
};

const finalState = (input: MazeInput) => {
  const frames = mazeModule.generate(input).frames;
  return frames[frames.length - 1].state;
};

describe('Maze solver (backtracking)', () => {
  it('finds a path from start to goal', () => {
    const state = finalState(fixture);
    expect(state.solved).toBe(true);
    expect(state.path[0]).toEqual([0, 0]);
    expect(state.path[state.path.length - 1]).toEqual([3, 3]);
  });

  it('produces a contiguous path over open cells only', () => {
    const { path } = finalState(fixture);
    for (const [r, c] of path) {
      expect(fixture.grid[r][c]).toBe(0);
    }
    for (let i = 1; i < path.length; i += 1) {
      const [pr, pc] = path[i - 1];
      const [r, c] = path[i];
      expect(Math.abs(pr - r) + Math.abs(pc - c)).toBe(1);
    }
  });

  it('reports unsolvable when the start is walled in', () => {
    const blocked: MazeInput = {
      rows: 4,
      cols: 4,
      grid: [
        [0, 1, 1, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 1, 1, 0],
      ],
      start: [0, 0],
      goal: [0, 3],
    };
    expect(finalState(blocked).solved).toBe(false);
  });
});
