import { describe, expect, it } from 'vitest';
import { coinChangeModule, type CoinInput } from './coinChange';

const answer = (input: CoinInput): number | null => {
  const frames = coinChangeModule.generate(input).frames;
  const grid = frames[frames.length - 1].state.grid;
  return grid[input.coins.length][input.amount];
};

describe('Coin change (minimum coins)', () => {
  it('uses the optimal count even when greedy fails', () => {
    expect(answer({ coins: [1, 3, 4], amount: 6 })).toBe(2);
  });

  it('returns 0 for amount zero', () => {
    expect(answer({ coins: [1, 2, 5], amount: 0 })).toBe(0);
  });

  it('reports unreachable amounts as null', () => {
    expect(answer({ coins: [2], amount: 3 })).toBeNull();
  });

  it('solves the canonical 11 with {1,2,5}', () => {
    expect(answer({ coins: [1, 2, 5], amount: 11 })).toBe(3);
  });
});
