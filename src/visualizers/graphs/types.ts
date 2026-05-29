export interface GraphNode {
  id: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
}

export interface GraphInput {
  nodes: GraphNode[];
  edges: GraphEdge[];
  start: string;
  goal?: string;
  directed?: boolean;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visited: string[];
  frontier: string[];
  current: string | null;
  activeEdge: [string, string] | null;
  order: string[];
  distances: Record<string, number>;
  path: string[];
  treeEdges: [string, string][];
  goal: string | null;
  directed: boolean;
  components?: Record<string, number>;
  marked?: string[];
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
  distances: {},
  path: [],
  treeEdges: [],
  goal: null,
  directed: false,
  ...partial,
});

export const buildAdjacency = (
  nodes: GraphNode[],
  edges: GraphEdge[],
  directed = false
): Map<string, string[]> => {
  const adjacency = new Map<string, string[]>();
  nodes.forEach((node) => adjacency.set(node.id, []));
  edges.forEach(({ source, target }) => {
    adjacency.get(source)?.push(target);
    if (!directed) adjacency.get(target)?.push(source);
  });
  adjacency.forEach((neighbors) => neighbors.sort());
  return adjacency;
};

export const sccSample = (): GraphInput => ({
  start: 'A',
  directed: true,
  nodes: [
    { id: 'A', x: 18, y: 22 },
    { id: 'B', x: 40, y: 14 },
    { id: 'C', x: 34, y: 44 },
    { id: 'D', x: 62, y: 30 },
    { id: 'E', x: 84, y: 20 },
    { id: 'F', x: 78, y: 52 },
    { id: 'G', x: 52, y: 78 },
    { id: 'H', x: 82, y: 80 },
  ],
  edges: [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' },
    { source: 'C', target: 'A' },
    { source: 'C', target: 'D' },
    { source: 'D', target: 'E' },
    { source: 'E', target: 'F' },
    { source: 'F', target: 'D' },
    { source: 'F', target: 'G' },
    { source: 'G', target: 'H' },
    { source: 'H', target: 'G' },
  ],
});

export const dagSample = (): GraphInput => ({
  start: 'A',
  directed: true,
  nodes: [
    { id: 'A', x: 14, y: 24 },
    { id: 'B', x: 14, y: 72 },
    { id: 'C', x: 42, y: 24 },
    { id: 'D', x: 42, y: 72 },
    { id: 'E', x: 72, y: 48 },
    { id: 'F', x: 90, y: 76 },
  ],
  edges: [
    { source: 'A', target: 'C' },
    { source: 'A', target: 'D' },
    { source: 'B', target: 'D' },
    { source: 'C', target: 'D' },
    { source: 'C', target: 'E' },
    { source: 'D', target: 'E' },
    { source: 'E', target: 'F' },
  ],
});

export interface WeightedEdge {
  to: string;
  weight: number;
}

export const buildWeightedAdjacency = (
  nodes: GraphNode[],
  edges: GraphEdge[]
): Map<string, WeightedEdge[]> => {
  const adjacency = new Map<string, WeightedEdge[]>();
  nodes.forEach((node) => adjacency.set(node.id, []));
  edges.forEach(({ source, target, weight = 1 }) => {
    adjacency.get(source)?.push({ to: target, weight });
    adjacency.get(target)?.push({ to: source, weight });
  });
  adjacency.forEach((neighbors) => neighbors.sort((a, b) => a.to.localeCompare(b.to)));
  return adjacency;
};

export const euclidean = (a: GraphNode, b: GraphNode): number =>
  Math.round(Math.hypot(a.x - b.x, a.y - b.y) / 10);

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

export const weightedSampleGraph = (): GraphInput => ({
  start: 'A',
  goal: 'H',
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
    { source: 'A', target: 'B', weight: 4 },
    { source: 'A', target: 'C', weight: 3 },
    { source: 'B', target: 'D', weight: 5 },
    { source: 'B', target: 'E', weight: 2 },
    { source: 'C', target: 'F', weight: 6 },
    { source: 'C', target: 'G', weight: 7 },
    { source: 'E', target: 'F', weight: 1 },
    { source: 'D', target: 'H', weight: 3 },
    { source: 'F', target: 'H', weight: 2 },
    { source: 'G', target: 'H', weight: 4 },
  ],
});

export const randomWeightedGraph = (count = 8): GraphInput => {
  const base = randomGraph(count);
  const edges = base.edges.map((edge) => ({
    ...edge,
    weight: Math.floor(Math.random() * 9) + 1,
  }));
  return {
    ...base,
    edges,
    goal: base.nodes[base.nodes.length - 1].id,
  };
};
