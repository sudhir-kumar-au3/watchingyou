import { describe, expect, it } from 'vitest';
import { hashTableModule, type HashInput, type HashState } from './hashTable';

const run = (input: HashInput): HashState => {
  const frames = hashTableModule.generate(input).frames;
  return frames[frames.length - 1].state;
};

const multiset = (values: number[]): number[] => [...values].sort((a, b) => a - b);

describe('Hash table', () => {
  it('chaining stores each key in bucket (key mod size)', () => {
    const values = [10, 17, 24, 3, 7, 14];
    const size = 7;
    const state = run({ values, size, strategy: 'chaining' });
    const flat: number[] = [];
    state.buckets.forEach((bucket, i) => {
      bucket.forEach((value) => {
        expect(value % size).toBe(i);
        flat.push(value);
      });
    });
    expect(multiset(flat)).toEqual(multiset(values));
  });

  it('linear probing keeps at most one key per slot and stores them all', () => {
    const values = [10, 17, 24, 3, 7];
    const size = 11;
    const state = run({ values, size, strategy: 'linear' });
    const flat: number[] = [];
    state.buckets.forEach((bucket) => {
      expect(bucket.length).toBeLessThanOrEqual(1);
      flat.push(...bucket);
    });
    expect(multiset(flat)).toEqual(multiset(values));
  });

  it('linear probing sends a colliding key to the next free slot', () => {
    const state = run({ values: [10, 21], size: 11, strategy: 'linear' });
    expect(state.buckets[10]).toEqual([10]);
    expect(state.buckets[0]).toEqual([21]);
  });
});
