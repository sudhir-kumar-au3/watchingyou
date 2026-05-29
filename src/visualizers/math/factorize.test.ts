import { describe, expect, it } from 'vitest';
import { factorizeModule } from './factorize';

const factors = (n: number): number[] => {
  const frames = factorizeModule.generate(n).frames;
  return frames[frames.length - 1].state.factors;
};

describe('Prime factorization', () => {
  it('factorizes 360 into its prime powers', () => {
    expect(factors(360)).toEqual([2, 2, 2, 3, 3, 5]);
  });

  it('returns a prime itself for a prime input', () => {
    expect(factors(17)).toEqual([17]);
  });

  it('handles a perfect power (100)', () => {
    expect(factors(100)).toEqual([2, 2, 5, 5]);
  });

  it('returns no factors for 1', () => {
    expect(factors(1)).toEqual([]);
  });

  it('multiplies back to the original', () => {
    const f = factors(8400);
    expect(f.reduce((a, b) => a * b, 1)).toBe(8400);
  });
});
