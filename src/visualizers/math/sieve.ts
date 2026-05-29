import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export interface SieveState {
  n: number;
  status: number[];
  current: number | null;
  marking: number | null;
}

export const createSieveState = (
  n: number,
  status: number[],
  partial: Partial<SieveState> = {}
): SieveState => ({
  n,
  status: [...status],
  current: null,
  marking: null,
  ...partial,
});

const SOURCE = `function sieve(n) {
  const prime = Array(n + 1).fill(true);
  for (let p = 2; p * p <= n; p++)
    if (prime[p])
      for (let m = p * p; m <= n; m += p) prime[m] = false;  // cross out
  return [...primes where prime[i]];
}`;

const generate = (n: number): Timeline<SieveState> => {
  const recorder = new TimelineRecorder<SieveState>();
  const status = new Array<number>(n + 1).fill(0);

  const snapshot = (description: string, partial: Partial<SieveState>): void => {
    recorder.capture(createSieveState(n, status, partial), description);
  };

  snapshot(`Write out every number from 2 to ${n}.`, {});

  for (let p = 2; p * p <= n; p += 1) {
    recorder.countComparison();
    if (status[p] === 2) continue;
    status[p] = 1;
    snapshot(`${p} is prime — cross out its multiples.`, { current: p });
    for (let m = p * p; m <= n; m += p) {
      if (status[m] !== 2) {
        status[m] = 2;
        recorder.countSwap();
        snapshot(`Cross out ${m} (a multiple of ${p}).`, {
          current: p,
          marking: m,
        });
      }
    }
  }

  for (let i = 2; i <= n; i += 1) {
    if (status[i] === 0) status[i] = 1;
  }
  const count = status.filter((s) => s === 1).length;
  snapshot(`The survivors are prime — ${count} primes up to ${n}.`, {});

  return recorder.build();
};

export const sieveModule: AlgorithmModule<SieveState, number> = {
  id: 'sieve',
  name: 'Sieve of Eratosthenes',
  category: 'math',
  tagline: 'Find every prime up to n by crossing out the multiples of each prime.',
  accent: '#a3e635',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Primes started',
    swaps: 'Numbers crossed out',
    accesses: 'Cells touched',
  },
  info: {
    explanation:
      'The Sieve of Eratosthenes finds all primes up to n. Start with every number marked prime; take the next number still marked prime, then cross out all of its multiples (starting at p² — smaller multiples already fell to smaller primes). Whatever survives is prime. It is far faster than testing each number for primality individually.',
    complexity: {
      timeBest: 'O(n log log n)',
      timeAverage: 'O(n log log n)',
      timeWorst: 'O(n log log n)',
      space: 'O(n)',
    },
    useCases: [
      'Generating prime tables',
      'Precomputation for number-theory problems',
      'Smallest-prime-factor sieves',
    ],
    realWorld: [
      'Cryptographic prime generation setup',
      'Competitive-programming preprocessing',
    ],
  },
  createDefaultInput: () => 50,
  generate,
};
