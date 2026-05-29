import { describe, expect, it } from 'vitest';
import { hanoiModule } from './hanoi';

const finalState = (n: number) => {
  const frames = hanoiModule.generate(n).frames;
  return frames[frames.length - 1].state;
};

describe('Tower of Hanoi', () => {
  it('solves in 2^n - 1 moves', () => {
    expect(finalState(3).moves).toBe(7);
    expect(finalState(4).moves).toBe(15);
  });

  it('ends with every disk stacked in order on the last peg', () => {
    const state = finalState(4);
    expect(state.pegs[0]).toEqual([]);
    expect(state.pegs[1]).toEqual([]);
    expect(state.pegs[2]).toEqual([4, 3, 2, 1]);
  });

  it('never places a larger disk on a smaller one', () => {
    const frames = hanoiModule.generate(4).frames;
    for (const { state } of frames) {
      for (const peg of state.pegs) {
        for (let i = 1; i < peg.length; i += 1) {
          expect(peg[i]).toBeLessThan(peg[i - 1]);
        }
      }
    }
  });
});
