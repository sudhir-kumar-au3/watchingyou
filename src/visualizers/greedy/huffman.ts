import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export interface HuffNodeView {
  id: string;
  label: string;
  freq: number;
  x: number;
  y: number;
  isLeaf: boolean;
  step: number;
}

export interface HuffEdgeView {
  parent: string;
  child: string;
  bit: string;
  step: number;
}

export interface HuffmanState {
  nodes: HuffNodeView[];
  edges: HuffEdgeView[];
  merging: string[];
  codes: { char: string; code: string }[];
}

export interface HuffmanInput {
  text: string;
}

interface TNode {
  id: string;
  label: string;
  freq: number;
  left: TNode | null;
  right: TNode | null;
  isLeaf: boolean;
  step: number;
  x: number;
  depth: number;
}

const SOURCE = `function huffman(freqs) {
  const heap = leaves(freqs);            // min-heap by frequency
  while (heap.size > 1) {
    const a = heap.pop(), b = heap.pop();    // two smallest
    heap.push({ freq: a.freq + b.freq, left: a, right: b });
  }
  return assignCodes(heap.pop());        // left = 0, right = 1
}`;

const generate = (input: HuffmanInput): Timeline<HuffmanState> => {
  const recorder = new TimelineRecorder<HuffmanState>();
  const text = input.text.replace(/\s+/g, '').slice(0, 16) || 'huffman';

  const freq = new Map<string, number>();
  for (const ch of text) freq.set(ch, (freq.get(ch) ?? 0) + 1);

  let counter = 0;
  const pool: TNode[] = [...freq.entries()].map(([label, f]) => ({
    id: `n${counter++}`,
    label,
    freq: f,
    left: null,
    right: null,
    isLeaf: true,
    step: 0,
    x: 0,
    depth: 0,
  }));

  const merges: TNode[] = [];
  let step = 0;
  while (pool.length > 1) {
    pool.sort((a, b) => a.freq - b.freq || a.id.localeCompare(b.id));
    const a = pool.shift() as TNode;
    const b = pool.shift() as TNode;
    step += 1;
    const parent: TNode = {
      id: `n${counter++}`,
      label: '',
      freq: a.freq + b.freq,
      left: a,
      right: b,
      isLeaf: false,
      step,
      x: 0,
      depth: 0,
    };
    merges.push(parent);
    pool.push(parent);
  }
  const root = pool[0];

  let leafIndex = 0;
  let maxDepth = 0;
  const assign = (node: TNode, depth: number): void => {
    node.depth = depth;
    maxDepth = Math.max(maxDepth, depth);
    if (node.isLeaf) {
      node.x = leafIndex;
      leafIndex += 1;
    } else {
      assign(node.left as TNode, depth + 1);
      assign(node.right as TNode, depth + 1);
      node.x = ((node.left as TNode).x + (node.right as TNode).x) / 2;
    }
  };
  assign(root, 0);

  const all: TNode[] = [];
  const collect = (node: TNode): void => {
    all.push(node);
    if (node.left) collect(node.left);
    if (node.right) collect(node.right);
  };
  collect(root);

  const leaves = Math.max(leafIndex - 1, 1);
  const toView = (node: TNode): HuffNodeView => ({
    id: node.id,
    label: node.label,
    freq: node.freq,
    x: leafIndex <= 1 ? 50 : 8 + (node.x / leaves) * 84,
    y: 12 + node.depth * (76 / Math.max(maxDepth, 1)),
    isLeaf: node.isLeaf,
    step: node.step,
  });
  const views = all.map(toView);

  const edges: HuffEdgeView[] = [];
  all.forEach((node) => {
    if (node.left) edges.push({ parent: node.id, child: node.left.id, bit: '0', step: node.step });
    if (node.right) edges.push({ parent: node.id, child: node.right.id, bit: '1', step: node.step });
  });

  const codes: { char: string; code: string }[] = [];
  const walk = (node: TNode, prefix: string): void => {
    if (node.isLeaf) {
      codes.push({ char: node.label, code: prefix || '0' });
      return;
    }
    if (node.left) walk(node.left, `${prefix}0`);
    if (node.right) walk(node.right, `${prefix}1`);
  };
  walk(root, '');

  const snapshot = (
    description: string,
    visibleStep: number,
    partial: Partial<HuffmanState>
  ): void => {
    recorder.capture(
      {
        nodes: views.filter((n) => n.step <= visibleStep),
        edges: edges.filter((e) => e.step <= visibleStep),
        merging: [],
        codes: [],
        ...partial,
      },
      description
    );
  };

  snapshot(`Each character is a leaf weighted by how often it appears in "${text}".`, 0, {});

  for (let k = 1; k <= step; k += 1) {
    const parent = merges[k - 1];
    recorder.countComparison();
    recorder.countSwap();
    snapshot(
      `Merge the two smallest (${(parent.left as TNode).freq} + ${(parent.right as TNode).freq} = ${parent.freq}).`,
      k,
      { merging: [(parent.left as TNode).id, (parent.right as TNode).id] }
    );
  }

  snapshot('Huffman tree complete — left = 0, right = 1 gives prefix-free codes.', step, {
    codes,
  });

  return recorder.build();
};

export const huffmanModule: AlgorithmModule<HuffmanState, HuffmanInput> = {
  id: 'huffman',
  name: 'Huffman Coding',
  category: 'greedy',
  tagline: 'Build an optimal prefix code by greedily merging the rarest symbols.',
  accent: '#fbbf24',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Merges considered',
    swaps: 'Nodes merged',
    accesses: 'Steps',
  },
  info: {
    explanation:
      'Huffman coding builds an optimal prefix-free binary code. Start with one leaf per symbol weighted by frequency; repeatedly merge the two lowest-frequency nodes under a new parent until one tree remains. Labelling left edges 0 and right edges 1 gives each symbol a code whose length shrinks for frequent symbols — provably minimising the total encoded length. It is the classic example of a correct greedy choice.',
    complexity: {
      timeBest: 'O(n log n)',
      timeAverage: 'O(n log n)',
      timeWorst: 'O(n log n)',
      space: 'O(n)',
    },
    useCases: [
      'Lossless compression codecs',
      'Prefix-code / entropy coding',
      'Optimal merge ordering',
    ],
    realWorld: [
      'DEFLATE (gzip, PNG, ZIP)',
      'JPEG and MP3 entropy stages',
    ],
  },
  createDefaultInput: () => ({ text: 'abracadabra' }),
  generate,
};
