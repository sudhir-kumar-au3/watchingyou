import { describe, expect, it } from 'vitest';
import { gcdModule } from './gcd';

const result = (a: number, b: number): number => {
  const frames = gcdModule.generate({ a, b }).frames;
  return frames[frames.length - 1].state.a;
};

describe('Euclidean GCD', () => {
  it('computes gcd(48, 18) = 6', () => {
    expect(result(48, 18)).toBe(6);
  });

  it('returns 1 for coprime inputs', () => {
    expect(result(17, 5)).toBe(1);
  });

  it('handles a multiple (gcd(100, 10) = 10)', () => {
    expect(result(100, 10)).toBe(10);
  });

  it('is order-independent', () => {
    expect(result(18, 48)).toBe(6);
  });
});
