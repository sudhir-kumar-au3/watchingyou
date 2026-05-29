import { describe, expect, it } from 'vitest';
import { huffmanModule } from './huffman';

const finalState = (text: string) => {
  const frames = huffmanModule.generate({ text }).frames;
  return frames[frames.length - 1].state;
};

const isPrefixFree = (codes: string[]): boolean =>
  codes.every((a, i) =>
    codes.every((b, j) => i === j || !b.startsWith(a))
  );

describe('Huffman coding', () => {
  it('creates one leaf per distinct character', () => {
    const state = finalState('abracadabra');
    const leaves = state.nodes.filter((n) => n.isLeaf);
    expect(leaves.length).toBe(new Set('abracadabra'.split('')).size);
  });

  it('roots a tree whose weight equals the text length', () => {
    const state = finalState('abracadabra');
    const maxFreq = Math.max(...state.nodes.map((n) => n.freq));
    expect(maxFreq).toBe('abracadabra'.length);
  });

  it('assigns prefix-free codes', () => {
    const state = finalState('abracadabra');
    expect(isPrefixFree(state.codes.map((c) => c.code))).toBe(true);
    expect(state.codes.length).toBe(new Set('abracadabra'.split('')).size);
  });
});
