import { describe, expect, it } from 'vitest';
import { permutationsModule } from './permutations';

const results = (items: number[]): number[][] => {
  const frames = permutationsModule.generate(items).frames;
  return frames[frames.length - 1].state.results;
};

const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

describe('Permutations (backtracking)', () => {
  it('generates n! permutations', () => {
    expect(results([1, 2, 3]).length).toBe(factorial(3));
    expect(results([1, 2, 3, 4]).length).toBe(factorial(4));
  });

  it('produces distinct permutations that are all valid', () => {
    const all = results([1, 2, 3]);
    const keys = new Set(all.map((p) => p.join(',')));
    expect(keys.size).toBe(all.length);
    for (const perm of all) {
      expect([...perm].sort((a, b) => a - b)).toEqual([1, 2, 3]);
    }
  });
});
