import { describe, expect, it } from 'vitest';
import { heapModule } from './heap';

const finalValues = (input: number[]): number[] => {
  const frames = heapModule.generate(input).frames;
  return frames[frames.length - 1].state.values;
};

describe('Binary heap', () => {
  it('heap-sorts the array ascending', () => {
    const input = [5, 2, 8, 1, 9, 3, 7];
    expect(finalValues(input)).toEqual([...input].sort((a, b) => a - b));
  });

  it('satisfies the max-heap property once built', () => {
    const input = [5, 2, 8, 1, 9, 3, 7, 4];
    const frames = heapModule.generate(input).frames;
    const built = frames.find((frame) =>
      frame.description.includes('Max-heap built')
    );
    if (!built) throw new Error('expected a "Max-heap built" frame');
    const { values, size } = built.state;
    expect(size).toBe(input.length);
    for (let i = 0; i < size; i += 1) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < size) expect(values[i]).toBeGreaterThanOrEqual(values[left]);
      if (right < size) expect(values[i]).toBeGreaterThanOrEqual(values[right]);
    }
  });

  it('handles a single element', () => {
    expect(finalValues([42])).toEqual([42]);
  });
});
