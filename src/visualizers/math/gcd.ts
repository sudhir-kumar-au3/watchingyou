import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export interface GcdInput {
  a: number;
  b: number;
}

export interface GcdState {
  a: number;
  b: number;
  quotient: number | null;
  remainder: number | null;
  max: number;
  done: boolean;
}

export const createGcdState = (
  partial: Partial<GcdState> & Pick<GcdState, 'a' | 'b' | 'max'>
): GcdState => ({
  quotient: null,
  remainder: null,
  done: false,
  ...partial,
});

const SOURCE = `function gcd(a, b) {
  while (b !== 0) {
    const r = a % b;   // remainder
    a = b;             // shift down
    b = r;
  }
  return a;            // gcd
}`;

export const randomGcdInput = (): GcdInput => ({
  a: Math.floor(Math.random() * 90) + 10,
  b: Math.floor(Math.random() * 90) + 10,
});

const generate = (input: GcdInput): Timeline<GcdState> => {
  const recorder = new TimelineRecorder<GcdState>();
  let a = Math.max(Math.abs(input.a), Math.abs(input.b));
  let b = Math.min(Math.abs(input.a), Math.abs(input.b));
  const max = Math.max(a, 1);

  const snapshot = (description: string, partial: Partial<GcdState>): void => {
    recorder.capture(createGcdState({ a, b, max, ...partial }), description);
  };

  snapshot(`Find gcd(${a}, ${b}) by repeated remainders.`, {});

  while (b !== 0) {
    const quotient = Math.floor(a / b);
    const remainder = a % b;
    recorder.countComparison();
    recorder.countAccess();
    snapshot(`${a} = ${quotient} × ${b} + ${remainder}.`, {
      quotient,
      remainder,
    });
    a = b;
    b = remainder;
    recorder.countSwap();
    snapshot(`Shift down: (a, b) = (${a}, ${b}).`, {});
  }

  snapshot(`b is 0 — the gcd is ${a}.`, { done: true });
  return recorder.build();
};

export const gcdModule: AlgorithmModule<GcdState, GcdInput> = {
  id: 'gcd',
  name: 'Euclidean GCD',
  category: 'math',
  tagline: 'Greatest common divisor by repeatedly taking remainders.',
  accent: '#22d3ee',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Divisions',
    swaps: 'Shifts',
    accesses: 'Remainders',
  },
  info: {
    explanation:
      "Euclid's algorithm computes the greatest common divisor using one fact: gcd(a, b) = gcd(b, a mod b). Each step replaces the larger number with the remainder of dividing it by the smaller, and the pair shrinks fast (the remainder is always less than b). When the remainder hits 0, the other number is the gcd. It is one of the oldest algorithms still in use.",
    complexity: {
      timeBest: 'O(1)',
      timeAverage: 'O(log min(a, b))',
      timeWorst: 'O(log min(a, b))',
      space: 'O(1)',
    },
    useCases: [
      'Reducing fractions to lowest terms',
      'Modular inverses (extended Euclid)',
      'Least common multiple via a·b / gcd',
    ],
    realWorld: [
      'RSA and modular arithmetic',
      'Aspect-ratio and gear-ratio simplification',
    ],
  },
  createDefaultInput: () => ({ a: 48, b: 18 }),
  generate,
};
