import { describe, expect, it } from 'vitest';
import { frameTones } from './frameTones';

describe('frameTones', () => {
  it('extracts touched values from a sorting state', () => {
    const state = {
      array: [30, 10, 50, 20],
      comparing: [0, 2],
      swapping: [],
      writing: [],
      sorted: [],
    };
    expect(frameTones(state)).toEqual({ values: [30, 50], max: 50 });
  });

  it('includes swapping and writing indices for sorting', () => {
    const state = {
      array: [5, 8, 2],
      comparing: [],
      swapping: [1],
      writing: [2],
    };
    expect(frameTones(state)).toEqual({ values: [8, 2], max: 8 });
  });

  it('extracts touched values from a heap state', () => {
    const state = {
      values: [90, 40, 70, 10],
      size: 4,
      comparing: [1, 2],
      swapped: [],
      active: 0,
    };
    expect(frameTones(state)).toEqual({ values: [40, 70, 90], max: 90 });
  });

  it('returns null when nothing is touched', () => {
    expect(
      frameTones({ array: [1, 2, 3], comparing: [], swapping: [], writing: [] })
    ).toBeNull();
  });

  it('returns null for unrelated states', () => {
    expect(frameTones({ nodes: [], edges: [] })).toBeNull();
    expect(frameTones(null)).toBeNull();
    expect(frameTones('nope')).toBeNull();
  });
});
