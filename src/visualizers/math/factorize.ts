import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export interface FactorState {
  original: number;
  remaining: number;
  divisor: number | null;
  factors: number[];
  done: boolean;
}

export const createFactorState = (
  partial: Partial<FactorState> & Pick<FactorState, 'original' | 'remaining'>
): FactorState => ({
  divisor: null,
  factors: [],
  done: false,
  ...partial,
});

const SOURCE = `function factorize(n) {
  const factors = [];
  for (let d = 2; d * d <= n; d++)
    while (n % d === 0) { factors.push(d); n /= d; }  // peel off factor d
  if (n > 1) factors.push(n);                         // leftover prime
  return factors;
}`;

export const randomFactorInput = (): number => Math.floor(Math.random() * 980) + 20;

const generate = (input: number): Timeline<FactorState> => {
  const recorder = new TimelineRecorder<FactorState>();
  const original = Math.max(1, Math.floor(input));
  let remaining = original;
  const factors: number[] = [];

  const snapshot = (description: string, partial: Partial<FactorState>): void => {
    recorder.capture(
      createFactorState({ original, remaining, factors: [...factors], ...partial }),
      description
    );
  };

  snapshot(`Factorize ${original} by trial division.`, {});

  let d = 2;
  while (d * d <= remaining) {
    if (remaining % d === 0) {
      factors.push(d);
      remaining /= d;
      recorder.countSwap();
      snapshot(`${d} divides — peel it off, leaving ${remaining}.`, {
        divisor: d,
        factors: [...factors],
      });
    } else {
      recorder.countComparison();
      snapshot(`${d} does not divide ${remaining} — try ${d + 1}.`, {
        divisor: d,
      });
      d += 1;
    }
  }

  if (remaining > 1) {
    factors.push(remaining);
    snapshot(`${remaining} is prime — the final factor.`, {
      divisor: remaining,
      factors: [...factors],
      remaining: 1,
    });
  }

  snapshot(
    factors.length > 0
      ? `${original} = ${factors.join(' × ')}.`
      : `${original} has no prime factors.`,
    { done: true, remaining: 1 }
  );
  return recorder.build();
};

export const factorizeModule: AlgorithmModule<FactorState, number> = {
  id: 'factorize',
  name: 'Prime Factorization',
  category: 'math',
  tagline: 'Peel a number apart into primes by trial division.',
  accent: '#a855f7',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Divisors tried',
    swaps: 'Factors peeled',
    accesses: 'Steps',
  },
  info: {
    explanation:
      'Trial-division factorization repeatedly finds the smallest divisor of the remaining number. Starting at 2, while a divisor divides cleanly it is peeled off (and recorded) until it no longer does; then move to the next candidate. You only need to test up to √n, because any larger factor pairs with a smaller one already found — and whatever is left above 1 at the end is itself prime.',
    complexity: {
      timeBest: 'O(log n)',
      timeAverage: 'O(√n)',
      timeWorst: 'O(√n)',
      space: 'O(log n)',
    },
    useCases: [
      'Reducing fractions / simplifying radicals',
      'Divisor and totient computations',
      'Number-theory and crypto building blocks',
    ],
    realWorld: [
      'Key-size analysis (why big semiprimes are hard)',
      'Hash bucketing and CRT setups',
    ],
  },
  createDefaultInput: () => 360,
  generate,
};
