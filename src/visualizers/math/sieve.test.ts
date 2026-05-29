import { describe, expect, it } from 'vitest';
import { sieveModule } from './sieve';

const primesUpTo = (n: number): number[] => {
  const frames = sieveModule.generate(n).frames;
  const status = frames[frames.length - 1].state.status;
  const out: number[] = [];
  for (let i = 2; i <= n; i += 1) if (status[i] === 1) out.push(i);
  return out;
};

describe('Sieve of Eratosthenes', () => {
  it('lists the primes up to 30', () => {
    expect(primesUpTo(30)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  });

  it('marks composites as composite', () => {
    const frames = sieveModule.generate(20).frames;
    const status = frames[frames.length - 1].state.status;
    expect(status[9]).toBe(2);
    expect(status[15]).toBe(2);
    expect(status[7]).toBe(1);
  });
});
