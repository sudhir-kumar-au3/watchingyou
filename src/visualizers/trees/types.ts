export interface TreeNode {
  id: string;
  value: number;
  x: number;
  y: number;
}

export interface TreeEdge {
  parent: string;
  child: string;
}

export interface TreeState {
  nodes: TreeNode[];
  edges: TreeEdge[];
  comparing: string | null;
  active: string | null;
  visited: string[];
  path: string[];
}

export const createTreeState = (
  nodes: TreeNode[],
  edges: TreeEdge[],
  partial: Partial<TreeState> = {}
): TreeState => ({
  nodes,
  edges,
  comparing: null,
  active: null,
  visited: [],
  path: [],
  ...partial,
});

export const randomValues = (count = 9, max = 99): number[] => {
  const pool = new Set<number>();
  while (pool.size < count) {
    pool.add(Math.floor(Math.random() * max) + 1);
  }
  return [...pool];
};
