import { describe, expect, it } from 'vitest';
import { trieModule } from './trie';

const finalState = (words: string[], query: string) => {
  const frames = trieModule.generate({ words, query }).frames;
  return frames[frames.length - 1].state;
};

describe('Trie', () => {
  it('shares common prefixes (cat/car reuse c-a)', () => {
    const state = finalState(['cat', 'car'], '');
    // root + c + a + t + r = 5 nodes
    expect(state.nodes.length).toBe(5);
  });

  it('marks a searched word as found', () => {
    expect(finalState(['cat', 'car', 'dog'], 'car').found).toBe(true);
  });

  it('reports a missing word as not found', () => {
    expect(finalState(['cat', 'car'], 'cow').found).toBe(false);
  });

  it('treats a prefix that is not a complete word as not found', () => {
    expect(finalState(['cat'], 'ca').found).toBe(false);
  });

  it('creates one end-marker per distinct word', () => {
    const state = finalState(['do', 'dog', 'dorm'], '');
    expect(state.nodes.filter((node) => node.isEnd).length).toBe(3);
  });
});
