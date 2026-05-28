import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export type HashStrategy = 'chaining' | 'linear';

export interface HashInput {
  values: number[];
  size: number;
  strategy: HashStrategy;
}

export interface HashState {
  size: number;
  strategy: HashStrategy;
  buckets: number[][];
  inserting: number | null;
  home: number | null;
  probe: number[];
  activeBucket: number | null;
  collision: boolean;
  placedAt: number | null;
}

export const createHashState = (
  size: number,
  strategy: HashStrategy,
  buckets: number[][],
  partial: Partial<HashState> = {}
): HashState => ({
  size,
  strategy,
  buckets: buckets.map((bucket) => [...bucket]),
  inserting: null,
  home: null,
  probe: [],
  activeBucket: null,
  collision: false,
  placedAt: null,
  ...partial,
});

const SOURCE = `function insertChaining(table, key) {
  const i = key % table.length;
  table[i].push(key);               // prepend/append to the chain
}

function insertLinear(slots, key) {
  let i = key % slots.length;
  while (slots[i] !== null) {        // collision — probe forward
    i = (i + 1) % slots.length;
  }
  slots[i] = key;
}`;

export const randomHashInput = (strategy: HashStrategy = 'chaining'): HashInput => {
  const size = strategy === 'chaining' ? 7 : 11;
  const count = strategy === 'chaining' ? 8 : 6;
  const values = Array.from(
    { length: count },
    () => Math.floor(Math.random() * 90) + 10
  );
  return { values, size, strategy };
};

const generate = (input: HashInput): Timeline<HashState> => {
  const recorder = new TimelineRecorder<HashState>();
  const { size, strategy } = input;
  const buckets: number[][] = Array.from({ length: size }, () => []);

  const snapshot = (
    description: string,
    partial: Partial<HashState>
  ): void => {
    recorder.capture(createHashState(size, strategy, buckets, partial), description);
  };

  snapshot(
    `Empty table · ${size} buckets · ${
      strategy === 'chaining' ? 'separate chaining' : 'open addressing (linear probing)'
    }.`,
    {}
  );

  for (const value of input.values) {
    const home = value % size;
    recorder.countAccess();
    snapshot(`Hash ${value}: ${value} mod ${size} = ${home}.`, {
      inserting: value,
      home,
      activeBucket: home,
      probe: [home],
    });

    if (strategy === 'chaining') {
      const collision = buckets[home].length > 0;
      if (collision) recorder.countComparison();
      buckets[home].push(value);
      recorder.countSwap();
      snapshot(
        collision
          ? `Bucket ${home} is occupied — append ${value} to its chain.`
          : `Bucket ${home} is empty — store ${value}.`,
        { inserting: value, home, activeBucket: home, collision, placedAt: home }
      );
      continue;
    }

    let i = home;
    const probe = [home];
    let steps = 0;
    while (buckets[i].length > 0 && steps < size) {
      recorder.countComparison();
      snapshot(
        `Slot ${i} holds ${buckets[i][0]} — collision, probe the next slot.`,
        { inserting: value, home, activeBucket: i, probe: [...probe], collision: true }
      );
      i = (i + 1) % size;
      probe.push(i);
      steps += 1;
    }

    if (buckets[i].length === 0) {
      buckets[i].push(value);
      recorder.countSwap();
      recorder.countAccess(probe.length);
      const hops = probe.length - 1;
      snapshot(
        i === home
          ? `Slot ${home} is free — store ${value}.`
          : `Slot ${i} is free — store ${value} after ${hops} probe${hops === 1 ? '' : 's'}.`,
        { inserting: value, home, activeBucket: i, probe: [...probe], placedAt: i }
      );
    } else {
      snapshot(`Table is full — ${value} cannot be inserted.`, {
        inserting: value,
        home,
        probe: [...probe],
      });
    }
  }

  snapshot('All keys inserted — load factor shapes how long the chains/probes grow.', {});
  return recorder.build();
};

export const hashTableModule: AlgorithmModule<HashState, HashInput> = {
  id: 'hash-table',
  name: 'Hash Table',
  category: 'hashing',
  tagline: 'Map keys to buckets and resolve collisions by chaining or probing.',
  accent: '#fbbf24',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Collisions',
    swaps: 'Keys stored',
    accesses: 'Slots examined',
  },
  info: {
    explanation:
      'A hash table maps each key to a bucket via key mod size, giving average O(1) lookups. Collisions are unavoidable, so two strategies handle them: separate chaining keeps a list per bucket, while open addressing with linear probing scans forward to the next free slot. As the load factor (keys ÷ buckets) rises, chains lengthen and probe runs grow — which is why real tables resize.',
    complexity: {
      timeBest: 'O(1)',
      timeAverage: 'O(1)',
      timeWorst: 'O(n)',
      space: 'O(n)',
    },
    useCases: [
      'Dictionaries, sets, and caches',
      'De-duplication and frequency counting',
      'Symbol tables in compilers and interpreters',
    ],
    realWorld: [
      'Language map/dict/object implementations',
      'Database hash indexes and in-memory caches',
    ],
  },
  createDefaultInput: () => ({
    values: [8, 15, 3, 10, 5, 20, 14],
    size: 7,
    strategy: 'chaining',
  }),
  generate,
};
