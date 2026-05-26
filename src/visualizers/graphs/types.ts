export interface GraphNode {
  id: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphInput {
  nodes: GraphNode[];
  edges: GraphEdge[];
  start: string;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visited: string[];
  frontier: string[];
  current: string | null;
  activeEdge: [string, string] | null;
  order: string[];
}

export const createGraphState = (
  nodes: GraphNode[],
  edges: GraphEdge[],
  partial: Partial<GraphState> = {}
): GraphState => ({
  nodes,
  edges,
  visited: [],
  frontier: [],
  current: null,
  activeEdge: null,
  order: [],
  ...partial,
});

export const buildAdjacency = (
  nodes: GraphNode[],
  edges: GraphEdge[]
): Map<string, string[]> => {
  const adjacency = new Map<string, string[]>();
  nodes.forEach((node) => adjacency.set(node.id, []));
  edges.forEach(({ source, target }) => {
    adjacency.get(source)?.push(target);
    adjacency.get(target)?.push(source);
  });
  adjacency.forEach((neighbors) => neighbors.sort());
  return adjacency;
};

export const randomGraph = (count = 8): GraphInput => {
  const ids = Array.from({ length: count }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const nodes: GraphNode[] = ids.map((id, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return {
      id,
      x: 50 + Math.cos(angle) * 38,
      y: 50 + Math.sin(angle) * 38,
    };
  });

  const edgeSet = new Set<string>();
  const edges: GraphEdge[] = [];
  const addEdge = (source: string, target: string): void => {
    const key = [source, target].sort().join('-');
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push({ source, target });
  };

  for (let i = 1; i < count; i += 1) {
    const parent = ids[Math.floor(Math.random() * i)];
    addEdge(parent, ids[i]);
  }
  const extra = Math.ceil(count / 2);
  for (let k = 0; k < extra; k += 1) {
    const a = ids[Math.floor(Math.random() * count)];
    const b = ids[Math.floor(Math.random() * count)];
    if (a !== b) addEdge(a, b);
  }

  return { nodes, edges, start: ids[0] };
};

export const sampleGraph = (): GraphInput => ({
  start: 'A',
  nodes: [
    { id: 'A', x: 50, y: 12 },
    { id: 'B', x: 22, y: 36 },
    { id: 'C', x: 78, y: 36 },
    { id: 'D', x: 12, y: 68 },
    { id: 'E', x: 40, y: 64 },
    { id: 'F', x: 64, y: 66 },
    { id: 'G', x: 88, y: 68 },
    { id: 'H', x: 50, y: 90 },
  ],
  edges: [
    { source: 'A', target: 'B' },
    { source: 'A', target: 'C' },
    { source: 'B', target: 'D' },
    { source: 'B', target: 'E' },
    { source: 'C', target: 'F' },
    { source: 'C', target: 'G' },
    { source: 'E', target: 'F' },
    { source: 'D', target: 'H' },
    { source: 'F', target: 'H' },
    { source: 'G', target: 'H' },
  ],
});
