import { describe, expect, it } from 'vitest';
import { unionFindModule, type UnionFindState } from './unionFind';

const finalState = (): UnionFindState => {
  const input = unionFindModule.createDefaultInput();
  const frames = unionFindModule.generate(input).frames;
  return frames[frames.length - 1].state;
};

const rootOf = (parent: number[], x: number): number => {
  let r = x;
  while (parent[r] !== r) r = parent[r];
  return r;
};

describe('Union-Find', () => {
  it('connects every element into a single set by the end', () => {
    const { parent } = finalState();
    const root = rootOf(parent, 0);
    for (let i = 0; i < parent.length; i += 1) {
      expect(rootOf(parent, i)).toBe(root);
    }
  });

  it('path-compresses queried nodes to point straight at their root', () => {
    const { parent } = finalState();
    for (const node of [3, 7]) {
      const p = parent[node];
      expect(parent[p]).toBe(p);
    }
  });

  it('never creates a cycle (every chain terminates at a self-parent root)', () => {
    const { parent } = finalState();
    for (let i = 0; i < parent.length; i += 1) {
      const seen = new Set<number>();
      let cur = i;
      while (parent[cur] !== cur) {
        expect(seen.has(cur)).toBe(false);
        seen.add(cur);
        cur = parent[cur];
      }
    }
  });
});
