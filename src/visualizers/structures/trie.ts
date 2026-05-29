import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export interface TrieNodeView {
  id: string;
  char: string;
  x: number;
  y: number;
  isEnd: boolean;
}

export interface TrieEdgeView {
  parent: string;
  child: string;
}

export interface TrieState {
  nodes: TrieNodeView[];
  edges: TrieEdgeView[];
  active: string | null;
  path: string[];
  found: boolean | null;
}

export interface TrieInput {
  words: string[];
  query: string;
}

export const createTrieState = (
  nodes: TrieNodeView[],
  edges: TrieEdgeView[],
  partial: Partial<TrieState> = {}
): TrieState => ({
  nodes,
  edges,
  active: null,
  path: [],
  found: null,
  ...partial,
});

const SOURCE = `function insert(root, word) {
  let node = root;
  for (const ch of word) {
    if (!node.children[ch]) node.children[ch] = makeNode();
    node = node.children[ch];
  }
  node.isEnd = true;
}

function search(root, word) {
  let node = root;
  for (const ch of word) {
    node = node.children[ch];
    if (!node) return false;          // prefix missing
  }
  return node.isEnd;                   // full word?
}`;

interface TrieNode {
  id: string;
  char: string;
  children: Map<string, TrieNode>;
  isEnd: boolean;
  x: number;
  depth: number;
}

const layout = (
  root: TrieNode
): { nodes: TrieNodeView[]; edges: TrieEdgeView[] } => {
  let leaf = 0;
  let maxDepth = 0;

  const assign = (node: TrieNode, depth: number): number => {
    node.depth = depth;
    maxDepth = Math.max(maxDepth, depth);
    const kids = [...node.children.values()];
    if (kids.length === 0) {
      node.x = leaf;
      leaf += 1;
    } else {
      const xs = kids.map((kid) => assign(kid, depth + 1));
      node.x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    return node.x;
  };
  assign(root, 0);

  const total = Math.max(leaf - 1, 1);
  const nodes: TrieNodeView[] = [];
  const edges: TrieEdgeView[] = [];
  const place = (node: TrieNode): void => {
    const x = leaf <= 1 ? 50 : 8 + (node.x / total) * 84;
    const y = 10 + node.depth * (78 / Math.max(maxDepth, 1));
    nodes.push({ id: node.id, char: node.char, x, y, isEnd: node.isEnd });
    for (const kid of node.children.values()) {
      edges.push({ parent: node.id, child: kid.id });
      place(kid);
    }
  };
  place(root);
  return { nodes, edges };
};

const generate = (input: TrieInput): Timeline<TrieState> => {
  const recorder = new TimelineRecorder<TrieState>();
  let counter = 0;
  const newNode = (char: string): TrieNode => ({
    id: `n${counter++}`,
    char,
    children: new Map(),
    isEnd: false,
    x: 0,
    depth: 0,
  });
  const root = newNode('•');

  const snapshot = (description: string, partial: Partial<TrieState>): void => {
    const { nodes, edges } = layout(root);
    recorder.capture(createTrieState(nodes, edges, partial), description);
  };

  snapshot('Build a trie — shared prefixes share a path from the root.', {});

  for (const word of input.words) {
    let node = root;
    const path: string[] = [root.id];
    for (const ch of word) {
      recorder.countComparison();
      let next = node.children.get(ch);
      if (!next) {
        next = newNode(ch);
        node.children.set(ch, next);
        recorder.countSwap();
      }
      node = next;
      path.push(node.id);
      snapshot(`Insert "${word}": walk/create '${ch}'.`, {
        active: node.id,
        path: [...path],
      });
    }
    node.isEnd = true;
    snapshot(`"${word}" inserted — mark its last node as a word end.`, {
      active: node.id,
      path: [...path],
    });
  }

  const query = input.query.trim();
  if (query.length > 0) {
    let node: TrieNode | undefined = root;
    const path: string[] = [root.id];
    let ok = true;
    for (const ch of query) {
      recorder.countAccess();
      node = node?.children.get(ch);
      if (!node) {
        ok = false;
        snapshot(`Search "${query}": no edge for '${ch}' — not present.`, {
          path: [...path],
          found: false,
        });
        break;
      }
      path.push(node.id);
      snapshot(`Search "${query}": follow '${ch}'.`, {
        active: node.id,
        path: [...path],
      });
    }
    if (ok) {
      const found = node?.isEnd ?? false;
      snapshot(
        found
          ? `"${query}" is a complete word — found.`
          : `"${query}" is only a prefix, not a stored word.`,
        { active: node?.id ?? null, path: [...path], found }
      );
    }
  }

  return recorder.build();
};

export const trieModule: AlgorithmModule<TrieState, TrieInput> = {
  id: 'trie',
  name: 'Trie (Prefix Tree)',
  category: 'structure',
  tagline: 'Store strings by shared prefix; look one up character by character.',
  accent: '#38bdf8',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Edge checks',
    swaps: 'Nodes created',
    accesses: 'Search steps',
  },
  info: {
    explanation:
      'A trie (prefix tree) stores a set of strings so that words sharing a prefix share the path from the root. Each edge is labelled with a character and each node can flag the end of a word. Insertion and lookup both walk one character at a time, so they cost O(length) regardless of how many words are stored — independent of the dictionary size.',
    complexity: {
      timeBest: 'O(L)',
      timeAverage: 'O(L)',
      timeWorst: 'O(L)',
      space: 'O(N·L)',
    },
    useCases: [
      'Autocomplete and prefix search',
      'Spell-checking and dictionaries',
      'IP routing tables, word games',
    ],
    realWorld: [
      'Search-bar suggestions',
      'Contacts / emoji prefix lookup',
    ],
  },
  createDefaultInput: () => ({
    words: ['cat', 'car', 'card', 'dog', 'do'],
    query: 'card',
  }),
  generate,
};
