import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  createTreeState,
  randomValues,
  type TreeEdge,
  type TreeNode,
  type TreeState,
} from './types';

const SOURCE = `class Node { constructor(v) { this.value = v; this.left = this.right = null; } }

function insert(root, value) {
  if (root === null) return new Node(value);
  if (value < root.value) root.left = insert(root.left, value);
  else root.right = insert(root.right, value);
  return root;
}

function inorder(root, out) {
  if (root === null) return;
  inorder(root.left, out);
  out.push(root.value);
  inorder(root.right, out);
}`;

interface BstNode {
  id: string;
  value: number;
  left: BstNode | null;
  right: BstNode | null;
}

const layout = (
  root: BstNode | null
): { nodes: TreeNode[]; edges: TreeEdge[] } => {
  const nodes: TreeNode[] = [];
  const edges: TreeEdge[] = [];
  const ordered: { node: BstNode; depth: number }[] = [];
  let maxDepth = 0;

  const walk = (node: BstNode | null, depth: number): void => {
    if (!node) return;
    walk(node.left, depth + 1);
    ordered.push({ node, depth });
    maxDepth = Math.max(maxDepth, depth);
    walk(node.right, depth + 1);
  };
  walk(root, 0);

  const count = ordered.length;
  ordered.forEach(({ node, depth }, index) => {
    const x = count === 1 ? 50 : 8 + (index / (count - 1)) * 84;
    const y = 12 + depth * (74 / Math.max(maxDepth, 1));
    nodes.push({ id: node.id, value: node.value, x, y });
    if (node.left) edges.push({ parent: node.id, child: node.left.id });
    if (node.right) edges.push({ parent: node.id, child: node.right.id });
  });

  return { nodes, edges };
};

const generate = (values: number[]): Timeline<TreeState> => {
  const recorder = new TimelineRecorder<TreeState>();
  let root: BstNode | null = null;
  let counter = 0;

  const snapshot = (
    description: string,
    partial: Partial<TreeState>
  ): void => {
    const { nodes, edges } = layout(root);
    recorder.capture(createTreeState(nodes, edges, partial), description);
  };

  snapshot('Build a binary search tree by inserting each value.', {});

  for (const value of values) {
    const fresh: BstNode = {
      id: `n${counter++}`,
      value,
      left: null,
      right: null,
    };

    if (!root) {
      root = fresh;
      snapshot(`Insert ${value} as the root.`, { active: fresh.id });
      continue;
    }

    let cursor: BstNode = root;
    const path: string[] = [];
    while (true) {
      path.push(cursor.id);
      recorder.countComparison();
      snapshot(
        `Compare ${value} with ${cursor.value}.`,
        { comparing: cursor.id, path: [...path] }
      );
      if (value < cursor.value) {
        if (!cursor.left) {
          cursor.left = fresh;
          break;
        }
        cursor = cursor.left;
      } else {
        if (!cursor.right) {
          cursor.right = fresh;
          break;
        }
        cursor = cursor.right;
      }
    }
    recorder.countSwap();
    snapshot(`Insert ${value}.`, { active: fresh.id, path: [...path] });
  }

  const visited: string[] = [];
  const inorder = (node: BstNode | null): void => {
    if (!node) return;
    inorder(node.left);
    visited.push(node.id);
    recorder.countAccess();
    snapshot(`Visit ${node.value} (in-order).`, {
      active: node.id,
      visited: [...visited],
    });
    inorder(node.right);
  };
  inorder(root);

  snapshot('In-order traversal complete — values emerge sorted.', {
    visited: [...visited],
  });

  return recorder.build();
};

export const bstModule: AlgorithmModule<TreeState, number[]> = {
  id: 'bst',
  name: 'Binary Search Tree',
  category: 'tree',
  tagline: 'Insert by comparison, then read sorted with in-order traversal.',
  accent: '#22d3ee',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Comparisons',
    swaps: 'Insertions',
    accesses: 'Nodes visited',
  },
  info: {
    explanation:
      'A binary search tree keeps every left descendant smaller than a node and every right descendant larger. Inserting walks down from the root choosing left or right by comparison. An in-order traversal then visits nodes in ascending order.',
    complexity: {
      timeBest: 'O(log n)',
      timeAverage: 'O(log n)',
      timeWorst: 'O(n)',
      space: 'O(n)',
    },
    useCases: [
      'Ordered maps and sets',
      'Range queries and nearest-key lookups',
      'Maintaining a dynamically sorted collection',
    ],
    realWorld: [
      'Database indexes (as balanced BST variants)',
      'In-memory ordered key-value stores',
    ],
  },
  createDefaultInput: () => randomValues(9),
  generate,
};
