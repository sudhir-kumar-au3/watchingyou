import { describe, expect, it } from 'vitest';
import { avlModule } from './avl';
import type { TreeState } from './types';

const finalState = (values: number[]): TreeState => {
  const frames = avlModule.generate(values).frames;
  return frames[frames.length - 1].state;
};

const maxDepth = (state: TreeState): number => {
  const children = new Map<string, string[]>();
  const childIds = new Set<string>();
  state.edges.forEach(({ parent, child }) => {
    const list = children.get(parent) ?? [];
    list.push(child);
    children.set(parent, list);
    childIds.add(child);
  });
  const root = state.nodes.find((node) => !childIds.has(node.id));
  if (!root) return 0;
  let depth = 0;
  const walk = (id: string, level: number): void => {
    depth = Math.max(depth, level);
    (children.get(id) ?? []).forEach((child) => walk(child, level + 1));
  };
  walk(root.id, 0);
  return depth;
};

const inorderValues = (state: TreeState): number[] => {
  const byId = new Map(state.nodes.map((node) => [node.id, node.value]));
  return state.visited.map((id) => byId.get(id) as number);
};

describe('AVL tree', () => {
  it('stays balanced under ascending inserts instead of degenerating', () => {
    const state = finalState([1, 2, 3, 4, 5, 6, 7]);
    expect(maxDepth(state)).toBeLessThanOrEqual(2);
    expect(state.nodes.length).toBe(7);
  });

  it('keeps height logarithmic for 15 ascending inserts', () => {
    const values = Array.from({ length: 15 }, (_, i) => i + 1);
    expect(maxDepth(finalState(values))).toBeLessThanOrEqual(3);
  });

  it('produces a sorted in-order traversal', () => {
    const input = [5, 3, 8, 1, 4, 7, 9, 2, 6];
    const state = finalState(input);
    expect(inorderValues(state)).toEqual([...input].sort((a, b) => a - b));
  });

  it('records at least one rotation for a triggering sequence', () => {
    const frames = avlModule.generate([3, 2, 1]).frames;
    const rotated = frames.some((frame) => frame.state.rotating.length > 0);
    expect(rotated).toBe(true);
  });
});
