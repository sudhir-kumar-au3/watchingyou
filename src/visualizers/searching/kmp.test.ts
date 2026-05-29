import { describe, expect, it } from 'vitest';
import { kmpModule } from './kmp';

const finalState = (text: string, pattern: string) => {
  const frames = kmpModule.generate({ text, pattern }).frames;
  return frames[frames.length - 1].state;
};

const allOccurrences = (text: string, pattern: string): number[] => {
  const result: number[] = [];
  for (let i = 0; i + pattern.length <= text.length; i += 1) {
    if (text.slice(i, i + pattern.length) === pattern) result.push(i);
  }
  return result;
};

describe('KMP string matching', () => {
  it('computes the LPS / failure function', () => {
    expect(finalState('zzz', 'aabaa').lps).toEqual([0, 1, 0, 1, 2]);
  });

  it('finds all (including overlapping) occurrences', () => {
    const text = 'aaaaa';
    expect(finalState(text, 'aa').matches).toEqual(allOccurrences(text, 'aa'));
  });

  it('finds matches that reuse the failure function', () => {
    const text = 'ababdababcababd';
    expect(finalState(text, 'ababd').matches).toEqual(
      allOccurrences(text, 'ababd')
    );
  });

  it('reports no matches when the pattern is absent', () => {
    expect(finalState('abcabc', 'xyz').matches).toEqual([]);
  });
});
