import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  createTreeState,
  type TreeEdge,
  type TreeNode,
  type TreeState,
} from './types';

const SOURCE = `function height(n) { return n ? n.height : 0; }
function balance(n) { return n ? height(n.left) - height(n.right) : 0; }

function rotateRight(y) {
  const x = y.left; y.left = x.right; x.right = y;
  fixHeight(y); fixHeight(x);
  return x;
}
function rotateLeft(x) {
  const y = x.right; x.right = y.left; y.left = x;
  fixHeight(x); fixHeight(y);
  return y;
}

function insert(node, value) {
  if (!node) return leaf(value);
  if (value < node.value) node.left = insert(node.left, value);
  else node.right = insert(node.right, value);
  fixHeight(node);
  const b = balance(node);
  if (b > 1 && value < node.left.value) return rotateRight(node);
  if (b < -1 && value > node.right.value) return rotateLeft(node);
  if (b > 1) { node.left = rotateLeft(node.left); return rotateRight(node); }
  if (b < -1) { node.right = rotateRight(node.right); return rotateLeft(node); }
  return node;
}`;

interface AvlNode {
  id: string;
  value: number;
  left: AvlNode | null;
  right: AvlNode | null;
  height: number;
}

const height = (node: AvlNode | null): number => (node ? node.height : 0);
const balance = (node: AvlNode | null): number =>
  node ? height(node.left) - height(node.right) : 0;
const fixHeight = (node: AvlNode): void => {
  node.height = 1 + Math.max(height(node.left), height(node.right));
};

const badge = (factor: number): string =>
  factor > 0 ? `+${factor}` : `${factor}`;

const layout = (
  root: AvlNode | null
): { nodes: TreeNode[]; edges: TreeEdge[] } => {
  const nodes: TreeNode[] = [];
  const edges: TreeEdge[] = [];
  const ordered: { node: AvlNode; depth: number }[] = [];
  let maxDepth = 0;

  const walk = (node: AvlNode | null, depth: number): void => {
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
    nodes.push({ id: node.id, value: node.value, x, y, badge: badge(balance(node)) });
    if (node.left) edges.push({ parent: node.id, child: node.left.id });
    if (node.right) edges.push({ parent: node.id, child: node.right.id });
  });

  return { nodes, edges };
};

const generate = (values: number[]): Timeline<TreeState> => {
  const recorder = new TimelineRecorder<TreeState>();
  let root: AvlNode | null = null;
  let counter = 0;
  const ctx: { rotation: { description: string; pivots: string[] } | null } = {
    rotation: null,
  };

  const snapshot = (description: string, partial: Partial<TreeState>): void => {
    const { nodes, edges } = layout(root);
    recorder.capture(createTreeState(nodes, edges, partial), description);
  };

  const rotateRight = (y: AvlNode): AvlNode => {
    const x = y.left as AvlNode;
    y.left = x.right;
    x.right = y;
    fixHeight(y);
    fixHeight(x);
    recorder.countSwap();
    return x;
  };
  const rotateLeft = (x: AvlNode): AvlNode => {
    const y = x.right as AvlNode;
    x.right = y.left;
    y.left = x;
    fixHeight(x);
    fixHeight(y);
    recorder.countSwap();
    return y;
  };

  const insert = (node: AvlNode | null, value: number): AvlNode => {
    if (!node) {
      return { id: `n${counter++}`, value, left: null, right: null, height: 1 };
    }
    recorder.countComparison();
    if (value < node.value) {
      snapshot(`${value} < ${node.value} → go left.`, { comparing: node.id });
      node.left = insert(node.left, value);
    } else {
      snapshot(`${value} ≥ ${node.value} → go right.`, { comparing: node.id });
      node.right = insert(node.right, value);
    }

    fixHeight(node);
    const factor = balance(node);

    if (factor > 1 && value < (node.left as AvlNode).value) {
      ctx.rotation = {
        description: `${node.value} is left-heavy (bf +${factor}) → rotate right.`,
        pivots: [node.id, (node.left as AvlNode).id],
      };
      return rotateRight(node);
    }
    if (factor < -1 && value > (node.right as AvlNode).value) {
      ctx.rotation = {
        description: `${node.value} is right-heavy (bf ${factor}) → rotate left.`,
        pivots: [node.id, (node.right as AvlNode).id],
      };
      return rotateLeft(node);
    }
    if (factor > 1) {
      ctx.rotation = {
        description: `${node.value} is left-right heavy → rotate left then right.`,
        pivots: [node.id, (node.left as AvlNode).id],
      };
      node.left = rotateLeft(node.left as AvlNode);
      return rotateRight(node);
    }
    if (factor < -1) {
      ctx.rotation = {
        description: `${node.value} is right-left heavy → rotate right then left.`,
        pivots: [node.id, (node.right as AvlNode).id],
      };
      node.right = rotateRight(node.right as AvlNode);
      return rotateLeft(node);
    }
    return node;
  };

  snapshot('Build a self-balancing AVL tree — every node keeps |balance| ≤ 1.', {});

  for (const value of values) {
    ctx.rotation = null;
    if (!root) {
      root = insert(null, value);
      snapshot(`Insert ${value} as the root.`, { active: root.id });
      continue;
    }
    const newId = `n${counter}`;
    snapshot(`Insert ${value} — descend from the root.`, {});
    root = insert(root, value);
    const rotation = ctx.rotation as {
      description: string;
      pivots: string[];
    } | null;
    if (rotation) {
      snapshot(rotation.description, {
        active: newId,
        rotating: rotation.pivots,
      });
      snapshot(`Heights restored — subtree is balanced again.`, { active: newId });
    } else {
      snapshot(`Insert ${value} — balance still holds, no rotation.`, {
        active: newId,
      });
    }
  }

  const visited: string[] = [];
  const inorder = (node: AvlNode | null): void => {
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

  snapshot('In-order read is sorted — and height stayed O(log n) throughout.', {
    visited: [...visited],
  });

  return recorder.build();
};

export const avlModule: AlgorithmModule<TreeState, number[]> = {
  id: 'avl-tree',
  name: 'AVL Tree',
  category: 'tree',
  tagline: 'A self-balancing BST that rotates to keep its height logarithmic.',
  accent: '#a855f7',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Comparisons',
    swaps: 'Rotations',
    accesses: 'Nodes visited',
  },
  info: {
    explanation:
      'An AVL tree is a binary search tree that stores a height at every node and keeps each node’s balance factor (left height minus right height) within [-1, 1]. After an insertion unbalances a node, one single or double rotation restores balance, guaranteeing O(log n) height — unlike a plain BST, which degenerates to a list under sorted input.',
    complexity: {
      timeBest: 'O(log n)',
      timeAverage: 'O(log n)',
      timeWorst: 'O(log n)',
      space: 'O(n)',
    },
    useCases: [
      'Ordered maps/sets needing guaranteed lookups',
      'Workloads with adversarial or sorted insertion order',
      'In-memory indexes where worst-case latency matters',
    ],
    realWorld: [
      'Language standard-library ordered containers',
      'Database and filesystem indexes (balanced-tree family)',
    ],
  },
  createDefaultInput: () => [10, 20, 30, 40, 50, 25],
  generate,
};
