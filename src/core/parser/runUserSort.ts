import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import { createSortState, type SortState } from '@/visualizers/sorting/types';

export interface TraceResult {
  timeline: Timeline<SortState> | null;
  error: string | null;
}

const MAX_OPERATIONS = 12000;
const INDEX_PATTERN = /^\d+$/;

export const runUserSort = (code: string, input: number[]): TraceResult => {
  const recorder = new TimelineRecorder<SortState>();
  const data = [...input];
  let operations = 0;

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
    const factory = new Function(
      `"use strict";\n${code}\nreturn typeof sort === 'function' ? sort : null;`
    );
    const sort = factory() as ((array: number[]) => unknown) | null;
    if (typeof sort !== 'function') {
      return {
        timeline: null,
        error: 'Define a function named "sort" that accepts an array.',
      };
    }

    recorder.capture(createSortState([...data]), 'Initial array.');
    sort(proxy as unknown as number[]);
    recorder.capture(
      createSortState([...data], { sorted: data.map((_, index) => index) }),
      'Execution finished.'
    );

    return { timeline: recorder.build(), error: null };
  } catch (error) {
    return {
      timeline: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
