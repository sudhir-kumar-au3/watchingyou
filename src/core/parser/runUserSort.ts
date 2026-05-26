import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import { createSortState, type SortState } from '@/visualizers/sorting/types';

export interface TraceResult {
  timeline: Timeline<SortState> | null;
  error: string | null;
  note: string | null;
}

const MAX_OPERATIONS = 12000;
const INDEX_PATTERN = /^\d+$/;

const detectFunctionNames = (code: string): string[] => {
  const names = new Set<string>(['sort']);
  const declared = code.matchAll(/function\s+([A-Za-z_$][\w$]*)/g);
  for (const match of declared) names.add(match[1]);
  const assigned = code.matchAll(
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function|\()/g
  );
  for (const match of assigned) names.add(match[1]);
  return [...names];
};

export const runUserSort = (code: string, input: number[]): TraceResult => {
  const recorder = new TimelineRecorder<SortState>();
  const data = [...input];
  let operations = 0;
  let arrayOps = 0;

  const guard = (): void => {
    operations += 1;
    if (operations > MAX_OPERATIONS) {
      throw new Error(
        `Operation limit (${MAX_OPERATIONS}) exceeded — likely an infinite loop.`
      );
    }
  };

  const proxy = new Proxy(data, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && INDEX_PATTERN.test(prop)) {
        guard();
        arrayOps += 1;
        recorder.countComparison();
        recorder.countAccess();
        recorder.capture(
          createSortState([...target], { comparing: [Number(prop)] }),
          `Read index ${prop}.`
        );
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      if (typeof prop === 'string' && INDEX_PATTERN.test(prop)) {
        guard();
        arrayOps += 1;
        recorder.countSwap();
        recorder.countAccess();
        recorder.capture(
          createSortState([...target], { writing: [Number(prop)] }),
          `Write ${value} to index ${prop}.`
        );
      }
      return result;
    },
  });

  try {
    const candidates = detectFunctionNames(code);
    const selector = candidates
      .map((name) => `(typeof ${name} === 'function' ? ${name} : null)`)
      .join(', ');
    const factory = new Function(
      `"use strict";\n${code}\nreturn [${selector}].find((fn) => typeof fn === 'function') || null;`
    );
    const fn = factory() as ((array: number[]) => unknown) | null;
    if (typeof fn !== 'function') {
      return {
        timeline: null,
        error:
          'No function found. Define a function that takes an array, e.g. function sort(arr) { … }.',
        note: null,
      };
    }

    recorder.capture(createSortState([...data]), 'Initial array.');
    fn(proxy);
    const touchedArray = arrayOps > 0;
    recorder.capture(
      createSortState([...data], {
        sorted: touchedArray ? data.map((_, index) => index) : [],
      }),
      'Execution finished.'
    );

    const sortedCorrectly =
      JSON.stringify(data) === JSON.stringify([...data].sort((a, b) => a - b));

    let note: string | null = null;
    if (!touchedArray) {
      note =
        'Your function ran but never read or wrote the array by index — try an array algorithm that uses arr[i].';
    } else if (!sortedCorrectly) {
      note = 'Heads up: the array is not fully sorted at the end.';
    }

    return { timeline: recorder.build(), error: null, note };
  } catch (error) {
    return {
      timeline: null,
      error: error instanceof Error ? error.message : String(error),
      note: null,
    };
  }
};
