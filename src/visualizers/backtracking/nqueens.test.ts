import { describe, expect, it } from 'vitest';
import { nQueensModule } from './nqueens';

const solve = (n: number) => {
  const frames = nQueensModule.generate(n).frames;
  return frames[frames.length - 1].state;
};

const isValid = (queens: number[], n: number): boolean => {
  if (queens.some((col) => col < 0)) return false;
  for (let r1 = 0; r1 < n; r1 += 1) {
    for (let r2 = r1 + 1; r2 < n; r2 += 1) {
      if (queens[r1] === queens[r2]) return false;
      if (Math.abs(queens[r1] - queens[r2]) === Math.abs(r1 - r2)) return false;
    }
  }
  return true;
};

describe('N-Queens', () => {
  it('finds a valid arrangement for n=6', () => {
    const state = solve(6);
    expect(state.solved).toBe(true);
    expect(isValid(state.queens, 6)).toBe(true);
  });

  it('solves the classic n=4 board', () => {
    const state = solve(4);
    expect(state.solved).toBe(true);
    expect(isValid(state.queens, 4)).toBe(true);
  });

  it('places exactly one safe queen per row for n=8', () => {
    const state = solve(8);
    expect(state.queens.filter((col) => col >= 0).length).toBe(8);
    expect(isValid(state.queens, 8)).toBe(true);
  });
});
