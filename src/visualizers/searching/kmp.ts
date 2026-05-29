import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export interface KmpInput {
  text: string;
  pattern: string;
}

export type KmpStatus = 'compare' | 'match' | 'mismatch' | 'shift';

export interface KmpState {
  text: string;
  pattern: string;
  lps: number[];
  i: number;
  j: number;
  phase: 'build' | 'search' | 'done';
  status: KmpStatus;
  matches: number[];
}

export const createKmpState = (
  text: string,
  pattern: string,
  lps: number[],
  partial: Partial<KmpState> = {}
): KmpState => ({
  text,
  pattern,
  lps: [...lps],
  i: -1,
  j: -1,
  phase: 'search',
  status: 'compare',
  matches: [],
  ...partial,
});

const SOURCE = `function kmp(text, pat) {
  const lps = buildLps(pat);          // longest proper prefix = suffix
  let i = 0, j = 0;
  while (i < text.length) {
    if (text[i] === pat[j]) { i++; j++; if (j === pat.length) { report(i - j); j = lps[j - 1]; } }
    else if (j > 0) j = lps[j - 1];   // reuse: skip re-checking matched prefix
    else i++;
  }
}`;

const generate = (input: KmpInput): Timeline<KmpState> => {
  const recorder = new TimelineRecorder<KmpState>();
  const { text, pattern } = input;
  const m = pattern.length;
  const n = text.length;
  const lps = new Array<number>(m).fill(0);
  const matches: number[] = [];

  const snapshot = (description: string, partial: Partial<KmpState>): void => {
    recorder.capture(createKmpState(text, pattern, lps, { matches: [...matches], ...partial }), description);
  };

  snapshot('Build the failure function (LPS) for the pattern.', {
    phase: 'build',
    i: -1,
    j: -1,
  });

  let len = 0;
  let bi = 1;
  while (bi < m) {
    recorder.countComparison();
    snapshot(`Compare pattern[${bi}]='${pattern[bi]}' with pattern[${len}]='${pattern[len]}'.`, {
      phase: 'build',
      i: bi,
      j: len,
      status: 'compare',
    });
    if (pattern[bi] === pattern[len]) {
      len += 1;
      lps[bi] = len;
      recorder.countSwap();
      snapshot(`Match — lps[${bi}] = ${len}.`, {
        phase: 'build',
        i: bi,
        j: len - 1,
        status: 'match',
      });
      bi += 1;
    } else if (len > 0) {
      snapshot(`Mismatch — fall back len to lps[${len - 1}] = ${lps[len - 1]}.`, {
        phase: 'build',
        i: bi,
        j: len,
        status: 'shift',
      });
      len = lps[len - 1];
    } else {
      lps[bi] = 0;
      snapshot(`No prefix matches — lps[${bi}] = 0.`, {
        phase: 'build',
        i: bi,
        j: 0,
        status: 'mismatch',
      });
      bi += 1;
    }
  }

  snapshot(`Failure function ready — now scan the text.`, {
    phase: 'search',
    i: 0,
    j: 0,
  });

  let i = 0;
  let j = 0;
  while (i < n) {
    recorder.countComparison();
    recorder.countAccess();
    if (text[i] === pattern[j]) {
      snapshot(`text[${i}]='${text[i]}' matches pattern[${j}] — extend the match.`, {
        phase: 'search',
        i,
        j,
        status: 'match',
      });
      i += 1;
      j += 1;
      if (j === m) {
        matches.push(i - j);
        recorder.countSwap();
        snapshot(`Whole pattern matched — occurrence at index ${i - j}.`, {
          phase: 'search',
          i: i - 1,
          j: j - 1,
          status: 'match',
        });
        j = lps[j - 1];
      }
    } else {
      snapshot(`text[${i}]='${text[i]}' ≠ pattern[${j}]='${pattern[j]}' — mismatch.`, {
        phase: 'search',
        i,
        j,
        status: 'mismatch',
      });
      if (j > 0) {
        snapshot(`Reuse LPS: shift pattern so j = lps[${j - 1}] = ${lps[j - 1]} (text stays at ${i}).`, {
          phase: 'search',
          i,
          j,
          status: 'shift',
        });
        j = lps[j - 1];
      } else {
        i += 1;
      }
    }
  }

  snapshot(
    matches.length > 0
      ? `Done — ${matches.length} occurrence${matches.length === 1 ? '' : 's'} at ${matches.join(', ')}.`
      : `Done — the pattern does not occur in the text.`,
    { phase: 'done', i: -1, j: -1 }
  );

  return recorder.build();
};

export const kmpModule: AlgorithmModule<KmpState, KmpInput> = {
  id: 'kmp',
  name: 'KMP String Matching',
  category: 'searching',
  tagline: 'Find a pattern in text without backing up, using a failure function.',
  accent: '#fbbf24',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Comparisons',
    swaps: 'Matches/links',
    accesses: 'Text reads',
  },
  info: {
    explanation:
      'Knuth-Morris-Pratt searches for a pattern in O(n + m). It first precomputes a failure function (LPS): for each pattern position, the length of the longest proper prefix that is also a suffix. On a mismatch during the scan, instead of restarting, it shifts the pattern using the LPS so the already-matched prefix is never re-checked — the text pointer never moves backward.',
    complexity: {
      timeBest: 'O(n)',
      timeAverage: 'O(n + m)',
      timeWorst: 'O(n + m)',
      space: 'O(m)',
    },
    useCases: [
      'Substring search',
      'Streaming / single-pass matching',
      'Building blocks for multi-pattern search',
    ],
    realWorld: [
      'grep / editor find',
      'DNA sequence search, intrusion detection',
    ],
  },
  createDefaultInput: () => ({ text: 'ababdababcababd', pattern: 'ababd' }),
  generate,
};
