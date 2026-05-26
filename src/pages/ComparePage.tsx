import { useEffect, useMemo, useState } from 'react';
import { Swords } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Select, type SelectOption } from '@/components/ui/Select';
import { CompareLane } from '@/features/compare/CompareLane';
import { DatasetControls } from '@/features/visualizer/DatasetControls';
import { Legend } from '@/features/visualizer/Legend';
import { PlaybackControls } from '@/features/visualizer/PlaybackControls';
import { TimelineScrubber } from '@/features/visualizer/TimelineScrubber';
import { usePlaybackEngine } from '@/hooks/usePlaybackEngine';
import { usePlaybackStore } from '@/store/playbackStore';
import { sortingModules, type SortVisualModule } from '@/visualizers/registry';
import { randomArray } from '@/visualizers/sorting/types';

const MIN_SIZE = 6;
const MAX_SIZE = 32;

const OPTIONS: SelectOption[] = sortingModules.map((module) => ({
  value: module.algorithm.id,
  label: module.algorithm.name,
}));

const findModule = (id: string): SortVisualModule =>
  sortingModules.find((module) => module.algorithm.id === id) ??
  sortingModules[0];

export const ComparePage = () => {
  const [leftId, setLeftId] = useState('bubble-sort');
  const [rightId, setRightId] = useState('quick-sort');
  const [input, setInput] = useState<number[]>(() => randomArray(20));

  const index = usePlaybackStore((state) => state.index);
  const loadTimeline = usePlaybackStore((state) => state.loadTimeline);
  usePlaybackEngine();

  const left = findModule(leftId);
  const right = findModule(rightId);

  const leftTimeline = useMemo(
    () => left.algorithm.generate(input),
    [left, input]
  );
  const rightTimeline = useMemo(
    () => right.algorithm.generate(input),
    [right, input]
  );

  const leftLast = leftTimeline.frames.length - 1;
  const rightLast = rightTimeline.frames.length - 1;
  const maxFrames = Math.max(leftTimeline.frames.length, rightTimeline.frames.length);

  useEffect(() => {
    loadTimeline(maxFrames);
  }, [maxFrames, loadTimeline]);

  const leftFrame = leftTimeline.frames[Math.min(index, leftLast)] ?? null;
  const rightFrame = rightTimeline.frames[Math.min(index, rightLast)] ?? null;

  const leftFinal = leftTimeline.frames[leftLast]?.metrics;
  const rightFinal = rightTimeline.frames[rightLast]?.metrics;
  const leftWins =
    leftFinal && rightFinal && leftFinal.comparisons < rightFinal.comparisons;
  const rightWins =
    leftFinal && rightFinal && rightFinal.comparisons < leftFinal.comparisons;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-2 text-sm text-cyan">
          <Swords size={16} />
          Comparison mode
        </span>
        <h1 className="font-display text-3xl font-bold text-mist">
          Race two algorithms on the same data
        </h1>
        <p className="max-w-2xl text-sm text-haze">
          Both sides share one dataset and one clock. The faster algorithm
          finishes first and waits — the gap you see is the gap that matters.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Left algorithm"
          value={leftId}
          options={OPTIONS}
          onChange={setLeftId}
          accent={left.algorithm.accent}
        />
        <Select
          label="Right algorithm"
          value={rightId}
          options={OPTIONS}
          onChange={setRightId}
          accent={right.algorithm.accent}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CompareLane
          visual={left}
          frame={leftFrame}
          finished={index >= leftLast}
        />
        <CompareLane
          visual={right}
          frame={rightFrame}
          finished={index >= rightLast}
        />
      </div>

      <Panel className="flex flex-col gap-4 p-5">
        <TimelineScrubber />
        <PlaybackControls />
        <div className="border-t border-white/5 pt-4">
          <Legend />
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Panel className="flex flex-col gap-4 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-haze">
            Shared dataset
          </h3>
          <DatasetControls
            size={input.length}
            minSize={MIN_SIZE}
            maxSize={MAX_SIZE}
            onSizeChange={(next) => setInput(randomArray(next))}
            onShuffle={() => setInput(randomArray(input.length))}
            onCustom={(values) => setInput(values)}
          />
        </Panel>

        <Panel className="flex flex-col gap-3 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-haze">
            Verdict
          </h3>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span style={{ color: left.algorithm.accent }}>
              {left.algorithm.name}
            </span>
            <span className="font-mono text-haze">
              {leftFinal?.comparisons ?? 0} vs {rightFinal?.comparisons ?? 0}
            </span>
            <span style={{ color: right.algorithm.accent }}>
              {right.algorithm.name}
            </span>
          </div>
          <p className="text-xs text-haze">
            {leftWins
              ? `${left.algorithm.name} used fewer comparisons on this dataset.`
              : rightWins
                ? `${right.algorithm.name} used fewer comparisons on this dataset.`
                : 'Both used the same number of comparisons here.'}
          </p>
        </Panel>
      </div>
    </div>
  );
};
