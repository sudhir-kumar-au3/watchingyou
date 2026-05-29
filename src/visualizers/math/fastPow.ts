import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export interface FastPowInput {
  base: number;
  exp: number;
}

export interface FastPowState {
  base: number;
  exp: number;
  bits: number[];
  bitIndex: number | null;
  used: boolean;
  result: number;
  currentBase: number;
  done: boolean;
}

export const createFastPowState = (
  partial: Partial<FastPowState> &
    Pick<FastPowState, 'base' | 'exp' | 'bits' | 'result' | 'currentBase'>
): FastPowState => ({
  bitIndex: null,
  used: false,
  done: false,
  ...partial,
});

const SOURCE = `function fastPow(base, exp) {
  let result = 1;
  while (exp > 0) {
    if (exp & 1) result *= base;   // this binary digit is set
    base *= base;                  // square the base
    exp >>= 1;                     // drop the digit
  }
  return result;
}`;

export const randomFastPowInput = (): FastPowInput => ({
  base: Math.floor(Math.random() * 4) + 2,
  exp: Math.floor(Math.random() * 12) + 4,
});

const generate = (input: FastPowInput): Timeline<FastPowState> => {
  const recorder = new TimelineRecorder<FastPowState>();
  const base = input.base;
  const bits = input.exp === 0 ? [0] : input.exp.toString(2).split('').reverse().map(Number);
  let result = 1;
  let b = base;
  let e = input.exp;
  let index = 0;

  const snapshot = (description: string, partial: Partial<FastPowState>): void => {
    recorder.capture(
      createFastPowState({ base, exp: input.exp, bits, result, currentBase: b, ...partial }),
      description
    );
  };

  snapshot(`Compute ${base}^${input.exp} by squaring; read the exponent in binary.`, {});

  while (e > 0) {
    const bit = e & 1;
    recorder.countComparison();
    snapshot(`Bit ${index} of the exponent is ${bit}.`, {
      bitIndex: index,
      used: bit === 1,
    });
    if (bit === 1) {
      result *= b;
      recorder.countSwap();
      snapshot(`Bit is 1 → multiply result by ${b} → ${result}.`, {
        bitIndex: index,
        used: true,
      });
    }
    b *= b;
    e >>= 1;
    index += 1;
    if (e > 0) {
      recorder.countAccess();
      snapshot(`Square the base → ${b}; shift the exponent right.`, {});
    }
  }

  snapshot(`${base}^${input.exp} = ${result}.`, { done: true });
  return recorder.build();
};

export const fastPowModule: AlgorithmModule<FastPowState, FastPowInput> = {
  id: 'fast-pow',
  name: 'Fast Exponentiation',
  category: 'math',
  tagline: 'Raise to a power in O(log n) by squaring and reading binary digits.',
  accent: '#fbbf24',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Bits read',
    swaps: 'Multiplies',
    accesses: 'Squarings',
  },
  info: {
    explanation:
      'Exponentiation by squaring computes baseⁿ with about log₂n multiplications instead of n. Reading the exponent in binary, each bit corresponds to a successive square of the base (base, base², base⁴, …); whenever a bit is 1, that square is multiplied into the running result. The same trick powers modular exponentiation in cryptography.',
    complexity: {
      timeBest: 'O(log n)',
      timeAverage: 'O(log n)',
      timeWorst: 'O(log n)',
      space: 'O(1)',
    },
    useCases: [
      'Modular exponentiation (a^b mod m)',
      'Fast matrix power (e.g. Fibonacci)',
      'Any associative repeated operation',
    ],
    realWorld: [
      'RSA / Diffie-Hellman key math',
      'Hashing and pseudo-random generators',
    ],
  },
  createDefaultInput: () => ({ base: 3, exp: 13 }),
  generate,
};
