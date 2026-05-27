import { describe, expect, it } from 'vitest';
import { bstModule } from './bst';

const traversalValues = (values: number[]): number[] => {
  const frames = bstModule.generate(values).frames;
  const last = frames[frames.length - 1].state;
  const byId = new Map(last.nodes.map((node) => [node.id, node.value]));
  return last.visited.map((id) => byId.get(id) as number);
};

describe('Binary Search Tree', () => {
  it('produces an in-order traversal that is sorted ascending', () => {
    const input = [5, 3, 8, 1, 4, 7, 9, 2, 6];
    const result = traversalValues(input);
    expect(result).toEqual([...input].sort((a, b) => a - b));
  });

  it('builds a node per inserted value', () => {
    const input = [5, 3, 8, 1];
    const frames = bstModule.generate(input).frames;
    const last = frames[frames.length - 1].state;
    expect(last.nodes.length).toBe(input.length);
  });

  it('handles a single value', () => {
    const result = traversalValues([42]);
    expect(result).toEqual([42]);
  });
});
