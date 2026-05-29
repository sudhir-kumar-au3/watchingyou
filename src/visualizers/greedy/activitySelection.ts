import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';

export interface Activity {
  start: number;
  end: number;
}

export interface ActivityState {
  activities: Activity[];
  selected: number[];
  rejected: number[];
  current: number | null;
  lastEnd: number;
  maxTime: number;
}

export const createActivityState = (
  activities: Activity[],
  maxTime: number,
  partial: Partial<ActivityState> = {}
): ActivityState => ({
  activities,
  selected: [],
  rejected: [],
  current: null,
  lastEnd: 0,
  maxTime,
  ...partial,
});

const SOURCE = `function selectActivities(a) {
  a.sort((x, y) => x.end - y.end);   // earliest finish first
  let lastEnd = 0; const chosen = [];
  for (const act of a)
    if (act.start >= lastEnd) { chosen.push(act); lastEnd = act.end; }
  return chosen;
}`;

export const randomActivities = (count = 8): Activity[] =>
  Array.from({ length: count }, () => {
    const start = Math.floor(Math.random() * 12);
    return { start, end: start + Math.floor(Math.random() * 4) + 1 };
  });

const generate = (input: Activity[]): Timeline<ActivityState> => {
  const recorder = new TimelineRecorder<ActivityState>();
  const activities = [...input].sort((a, b) => a.end - b.end);
  const maxTime = Math.max(...activities.map((a) => a.end), 1);
  const selected: number[] = [];
  const rejected: number[] = [];
  let lastEnd = 0;

  const snapshot = (description: string, partial: Partial<ActivityState>): void => {
    recorder.capture(
      createActivityState(activities, maxTime, {
        selected: [...selected],
        rejected: [...rejected],
        lastEnd,
        ...partial,
      }),
      description
    );
  };

  snapshot('Sort by finish time, then greedily take the earliest that fits.', {});

  for (let i = 0; i < activities.length; i += 1) {
    const activity = activities[i];
    recorder.countComparison();
    if (activity.start >= lastEnd) {
      const prevEnd = lastEnd;
      selected.push(i);
      lastEnd = activity.end;
      recorder.countSwap();
      snapshot(`Activity [${activity.start}, ${activity.end}] starts at/after ${prevEnd} — take it.`, {
        current: i,
        selected: [...selected],
      });
    } else {
      rejected.push(i);
      snapshot(`Activity [${activity.start}, ${activity.end}] overlaps the last pick — skip it.`, {
        current: i,
        rejected: [...rejected],
      });
    }
  }

  snapshot(`Chosen ${selected.length} non-overlapping activities.`, {
    current: null,
  });
  return recorder.build();
};

export const activitySelectionModule: AlgorithmModule<ActivityState, Activity[]> = {
  id: 'activity-selection',
  name: 'Activity Selection',
  category: 'greedy',
  tagline: 'Pack the most non-overlapping activities by always taking the earliest finish.',
  accent: '#34d399',
  sourceCode: SOURCE,
  metricLabels: {
    comparisons: 'Activities checked',
    swaps: 'Activities chosen',
    accesses: 'Steps',
  },
  info: {
    explanation:
      'Activity selection picks the largest set of mutually compatible activities (no two overlapping). The greedy rule is provably optimal: sort by finish time, then repeatedly take the next activity that starts at or after the last chosen one finishes. Always finishing as early as possible leaves the most room for what follows.',
    complexity: {
      timeBest: 'O(n log n)',
      timeAverage: 'O(n log n)',
      timeWorst: 'O(n log n)',
      space: 'O(n)',
    },
    useCases: [
      'Scheduling non-overlapping jobs',
      'Interval partitioning / room booking',
      'Maximising throughput on one resource',
    ],
    realWorld: [
      'Meeting-room and CPU scheduling',
      'Ad-slot and broadcast planning',
    ],
  },
  createDefaultInput: () => [
    { start: 1, end: 4 },
    { start: 3, end: 5 },
    { start: 0, end: 6 },
    { start: 5, end: 7 },
    { start: 3, end: 9 },
    { start: 6, end: 10 },
    { start: 8, end: 11 },
    { start: 12, end: 14 },
  ],
  generate,
};
