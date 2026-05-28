import { describe, expect, it } from 'vitest';
import { avlModule, type AvlOp } from './avl';
import type { TreeState } from './types';

const ins = (values: number[]): AvlOp[] =>
  values.map((value) => ({ op: 'insert', value }));

const del = (value: number): AvlOp => ({ op: 'delete', value });

const finalState = (ops: AvlOp[]): TreeState => {
  const frames = avlModule.generate(ops).frames;
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

describe('AVL tree — insertion', () => {
  it('stays balanced under ascending inserts instead of degenerating', () => {
    const state = finalState(ins([1, 2, 3, 4, 5, 6, 7]));
    expect(maxDepth(state)).toBeLessThanOrEqual(2);
    expect(state.nodes.length).toBe(7);
  });

  it('keeps height logarithmic for 15 ascending inserts', () => {
    const values = Array.from({ length: 15 }, (_, i) => i + 1);
    expect(maxDepth(finalState(ins(values)))).toBeLessThanOrEqual(3);
  });

  it('produces a sorted in-order traversal', () => {
    const input = [5, 3, 8, 1, 4, 7, 9, 2, 6];
    expect(inorderValues(finalState(ins(input)))).toEqual(
      [...input].sort((a, b) => a - b)
    );
  });

  it('records a rotation for a triggering insert sequence', () => {
    const rotated = avlModule
      .generate(ins([3, 2, 1]))
      .frames.some((frame) => frame.state.rotating.length > 0);
    expect(rotated).toBe(true);
  });
});

describe('AVL tree — deletion', () => {
  it('rebalances with a rotation when a delete unbalances a node', () => {
    const frames = avlModule.generate([...ins([2, 1, 4, 3, 5]), del(1)]).frames;
    expect(frames.some((frame) => frame.state.rotating.length > 0)).toBe(true);
    const final = frames[frames.length - 1].state;
    expect(final.nodes.length).toBe(4);
    expect(maxDepth(final)).toBeLessThanOrEqual(2);
    expect(inorderValues(final)).toEqual([2, 3, 4, 5]);
  });

  it('removes the value and keeps an in-order-sorted tree', () => {
    const final = finalState([...ins([5, 3, 8, 1, 4, 7, 9]), del(8), del(3)]);
    const values = final.nodes.map((node) => node.value).sort((a, b) => a - b);
    expect(values).toEqual([1, 4, 5, 7, 9]);
    expect(inorderValues(final)).toEqual([1, 4, 5, 7, 9]);
  });

  it('ignores a delete for a value that is not present', () => {
    expect(finalState([...ins([5, 3, 8]), del(99)]).nodes.length).toBe(3);
  });
});
