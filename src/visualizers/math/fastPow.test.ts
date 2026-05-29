import { describe, expect, it } from 'vitest';
import { fastPowModule } from './fastPow';

const result = (base: number, exp: number): number => {
  const frames = fastPowModule.generate({ base, exp }).frames;
  return frames[frames.length - 1].state.result;
};

describe('Fast exponentiation', () => {
  it('computes 2^10 = 1024', () => {
    expect(result(2, 10)).toBe(1024);
  });

  it('computes 3^5 = 243', () => {
    expect(result(3, 5)).toBe(243);
  });

  it('returns 1 for exponent 0', () => {
    expect(result(7, 0)).toBe(1);
  });

  it('matches Math.pow across small inputs', () => {
    for (let b = 2; b <= 5; b += 1) {
      for (let e = 1; e <= 8; e += 1) {
        expect(result(b, e)).toBe(b ** e);
      }
    }
  });
});
