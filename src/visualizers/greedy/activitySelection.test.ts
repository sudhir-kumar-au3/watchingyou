import { describe, expect, it } from 'vitest';
import { activitySelectionModule, type Activity } from './activitySelection';

const run = (activities: Activity[]) => {
  const frames = activitySelectionModule.generate(activities).frames;
  return frames[frames.length - 1].state;
};

describe('Activity selection (greedy)', () => {
  it('selects a maximal non-overlapping set', () => {
    const activities: Activity[] = [
      { start: 1, end: 4 },
      { start: 3, end: 5 },
      { start: 0, end: 6 },
      { start: 5, end: 7 },
      { start: 3, end: 9 },
      { start: 5, end: 9 },
      { start: 6, end: 10 },
      { start: 8, end: 11 },
      { start: 12, end: 14 },
      { start: 2, end: 14 },
    ];
    const state = run(activities);
    expect(state.selected.length).toBe(4);
  });

  it('never selects two overlapping activities', () => {
    const state = run([
      { start: 1, end: 3 },
      { start: 2, end: 5 },
      { start: 4, end: 7 },
      { start: 8, end: 9 },
    ]);
    const chosen = state.selected
      .map((i) => state.activities[i])
      .sort((a, b) => a.start - b.start);
    for (let i = 1; i < chosen.length; i += 1) {
      expect(chosen[i].start).toBeGreaterThanOrEqual(chosen[i - 1].end);
    }
  });
});
