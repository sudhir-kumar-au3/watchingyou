import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import {
  createTreeState,
  type TreeEdge,
  type TreeNode,
  type TreeState,
} from './types';

export interface AvlOp {
  op: 'insert' | 'delete';
  value: number;
}

const SOURCE = `function balance(n) { return n ? height(n.left) - height(n.right) : 0; }

function rebalance(node) {
  fixHeight(node);
  const b = balance(node);
  if (b > 1 && balance(node.left) >= 0) return rotateRight(node);
  if (b > 1) { node.left = rotateLeft(node.left); return rotateRight(node); }
  if (b < -1 && balance(node.right) <= 0) return rotateLeft(node);
  if (b < -1) { node.right = rotateRight(node.right); return rotateLeft(node); }
  return node;
}

function remove(node, value) {
  if (!node) return null;
  if (value < node.value) node.left = remove(node.left, value);
  else if (value > node.value) node.right = remove(node.right, value);
  else {
    if (!node.left || !node.right) return node.left || node.right;
    const succ = min(node.right);          // in-order successor
    node.value = succ.value;
    node.right = remove(node.right, succ.value);
  }
  return rebalance(node);
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

export const randomAvlOps = (): AvlOp[] => {
  const pool = new Set<number>();
  while (pool.size < 8) pool.add(Math.floor(Math.random() * 99) + 1);
  const values = [...pool];
  const ops: AvlOp[] = values.map((value) => ({ op: 'insert', value }));
  const shuffled = [...values].sort(() => Math.random() - 0.5);
  ops.push({ op: 'delete', value: shuffled[0] });
  ops.push({ op: 'delete', value: shuffled[1] });
  return ops;
};

const generate = (ops: AvlOp[]): Timeline<TreeState> => {
  const recorder = new TimelineRecorder<TreeState>();
  let root: AvlNode | null = null;
  let counter = 0;
  const rotations: { description: string; pivots: string[] }[] = [];

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

  const rebalance = (node: AvlNode): AvlNode => {
    fixHeight(node);
    const factor = balance(node);
    if (factor > 1 && balance(node.left) >= 0) {
      rotations.push({
        description: `${node.value} is left-heavy (bf ${badge(factor)}) → rotate right.`,
        pivots: [node.id, (node.left as AvlNode).id],
      });
      return rotateRight(node);
    }
    if (factor > 1) {
      rotations.push({
        description: `${node.value} is left-right heavy → rotate left then right.`,
        pivots: [node.id, (node.left as AvlNode).id],
      });
      node.left = rotateLeft(node.left as AvlNode);
      return rotateRight(node);
    }
    if (factor < -1 && balance(node.right) <= 0) {
      rotations.push({
        description: `${node.value} is right-heavy (bf ${badge(factor)}) → rotate left.`,
        pivots: [node.id, (node.right as AvlNode).id],
      });
      return rotateLeft(node);
    }
    if (factor < -1) {
      rotations.push({
        description: `${node.value} is right-left heavy → rotate right then left.`,
        pivots: [node.id, (node.right as AvlNode).id],
      });
      node.right = rotateRight(node.right as AvlNode);
      return rotateLeft(node);
    }
    return node;
  };

  const contains = (value: number): boolean => {
    let cursor = root;
    while (cursor) {
      if (value === cursor.value) return true;
      cursor = value < cursor.value ? cursor.left : cursor.right;
    }
    return false;
  };

  const minNode = (node: AvlNode): AvlNode => {
    let cursor = node;
    while (cursor.left) cursor = cursor.left;
    return cursor;
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
    return rebalance(node);
  };

  const remove = (node: AvlNode | null, value: number, record: boolean): AvlNode | null => {
    if (!node) return null;
    if (value < node.value) {
      if (record) {
        recorder.countComparison();
        snapshot(`${value} < ${node.value} → search left.`, { comparing: node.id });
      }
      node.left = remove(node.left, value, record);
    } else if (value > node.value) {
      if (record) {
        recorder.countComparison();
        snapshot(`${value} > ${node.value} → search right.`, { comparing: node.id });
      }
      node.right = remove(node.right, value, record);
    } else {
      if (!node.left || !node.right) {
        const child = node.left ?? node.right;
        if (record) {
          snapshot(
            child
              ? `${node.value} has one child — splice it out, lift ${child.value}.`
              : `${node.value} is a leaf — remove it.`,
            { active: node.id }
          );
        }
        return child;
      }
      const successor = minNode(node.right);
      if (record) {
        snapshot(
          `${node.value} has two children — overwrite with in-order successor ${successor.value}.`,
          { active: node.id, comparing: successor.id }
        );
      }
      node.value = successor.value;
      node.right = remove(node.right, successor.value, false);
    }
    return rebalance(node);
  };

  const flush = (prefix: string, activeId: string | null): void => {
    if (rotations.length === 0) {
      snapshot(`${prefix} — balance still holds, no rotation.`, {
        ...(activeId ? { active: activeId } : {}),
      });
      return;
    }
    const pivots = rotations.flatMap((rotation) => rotation.pivots);
    const detail = rotations.map((rotation) => rotation.description).join(' ');
    snapshot(`${prefix} — rebalance: ${detail}`, {
      rotating: pivots,
      ...(activeId ? { active: activeId } : {}),
    });
    snapshot('Heights restored — every node is balanced again.', {
      ...(activeId ? { active: activeId } : {}),
    });
  };

  snapshot('AVL tree — inserts and deletes both rebalance with rotations.', {});

  for (const { op, value } of ops) {
    rotations.length = 0;
    if (op === 'insert') {
      if (contains(value)) {
        snapshot(`${value} is already present — skip insert.`, {});
        continue;
      }
      const newId = `n${counter}`;
      snapshot(`Insert ${value} — descend from the root.`, {});
      root = insert(root, value);
      flush(`Inserted ${value}`, newId);
    } else {
      if (!contains(value)) {
        snapshot(`${value} is not in the tree — nothing to delete.`, {});
        continue;
      }
      snapshot(`Delete ${value} — find it first.`, {});
      root = remove(root, value, true);
      flush(`Deleted ${value}`, null);
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

  snapshot('In-order read is sorted — and the height stayed O(log n) throughout.', {
    visited: [...visited],
  });

  return recorder.build();
};

export const avlModule: AlgorithmModule<TreeState, AvlOp[]> = {
  id: 'avl-tree',
  name: 'AVL Tree',
  category: 'tree',
  tagline: 'A self-balancing BST: inserts and deletes both rotate to stay O(log n).',
  accent: '#a855f7',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Comparisons',
    swaps: 'Rotations',
    accesses: 'Nodes visited',
  },
  info: {
    explanation:
      'An AVL tree keeps every node’s balance factor (left height minus right height) within [-1, 1]. Insertion needs at most one single or double rotation, but deletion can cascade: each ancestor on the path back to the root is re-checked and may rotate. The balance-factor of the heavy child decides single vs. double rotation. Either way the height stays logarithmic — unlike a plain BST, which degenerates under sorted input.',
    complexity: {
      timeBest: 'O(log n)',
      timeAverage: 'O(log n)',
      timeWorst: 'O(log n)',
      space: 'O(n)',
    },
    useCases: [
      'Ordered maps/sets needing guaranteed lookups',
      'Workloads with adversarial or sorted key order',
      'Insert- and delete-heavy indexes where worst-case latency matters',
    ],
    realWorld: [
      'Language standard-library ordered containers',
      'Database and filesystem indexes (balanced-tree family)',
    ],
  },
  createDefaultInput: () => [
    ...[10, 20, 30, 40, 50, 60, 70].map(
      (value): AvlOp => ({ op: 'insert', value })
    ),
    { op: 'delete', value: 70 },
    { op: 'delete', value: 60 },
    { op: 'delete', value: 50 },
  ],
  generate,
};
