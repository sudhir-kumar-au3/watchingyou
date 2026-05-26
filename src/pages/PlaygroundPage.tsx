import { useCallback, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { AlertTriangle, Info, Play, RotateCcw, Shuffle } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Legend } from '@/features/visualizer/Legend';
import { MetricsBar } from '@/features/visualizer/MetricsBar';
import { PlaybackControls } from '@/features/visualizer/PlaybackControls';
import { TimelineScrubber } from '@/features/visualizer/TimelineScrubber';
import { runUserSort } from '@/core/parser/runUserSort';
import { EMPTY_METRICS, type Timeline } from '@/core/timeline/types';
import { usePlaybackEngine } from '@/hooks/usePlaybackEngine';
import { usePlaybackStore } from '@/store/playbackStore';
import { SortingRenderer } from '@/visualizers/sorting/SortingRenderer';
import { randomArray, type SortState } from '@/visualizers/sorting/types';

const STARTER_CODE = `function sort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
      }
    }
  }
  return arr;
}`;

export const PlaygroundPage = () => {
  const [code, setCode] = useState(STARTER_CODE);
  const [input, setInput] = useState<number[]>(() => randomArray(14));
  const [timeline, setTimeline] = useState<Timeline<SortState> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const index = usePlaybackStore((state) => state.index);
  const loadTimeline = usePlaybackStore((state) => state.loadTimeline);
  const play = usePlaybackStore((state) => state.play);
  usePlaybackEngine();

  const run = useCallback(() => {
    const result = runUserSort(code, input);
    setError(result.error);
    setNote(result.note);
    setTimeline(result.timeline);
    if (result.timeline) {
      loadTimeline(result.timeline.frames.length);
      play();
    }
  }, [code, input, loadTimeline, play]);

  useEffect(() => {
    run();
  }, [run]);

  const frames = timeline?.frames ?? [];
  const safeIndex = Math.min(index, Math.max(frames.length - 1, 0));
  const frame = frames[safeIndex] ?? null;
  const metrics = frame?.metrics ?? EMPTY_METRICS;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-cyan">Code playground</span>
        <h1 className="font-display text-3xl font-bold text-mist">
          Watch your own code run
        </h1>
        <p className="max-w-2xl text-sm text-haze">
          Write a function named <code className="font-mono text-mist">sort</code>{' '}
          that takes an array. Every index read is highlighted as a comparison
          and every write as a mutation — your logic, visualized frame by frame.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Panel strong className="overflow-hidden p-0">
            <Editor
              height="380px"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value ?? '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </Panel>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={run}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan px-5 py-2.5 font-medium text-void shadow-glow transition hover:brightness-110 active:scale-95"
            >
              <Play size={16} />
              Run & visualize
            </button>
            <button
              type="button"
              onClick={() => setInput(randomArray(input.length))}
              className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
            >
              <Shuffle size={15} />
              New data
            </button>
            <button
              type="button"
              onClick={() => setCode(STARTER_CODE)}
              className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
            >
              <RotateCcw size={15} />
              Load example
            </button>
            <span className="font-mono text-xs text-haze">
              runs in your browser · 12k-op safety limit
            </span>
          </div>

          {error && (
            <Panel className="flex items-start gap-3 border-rose/30 p-4">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-rose">
                  Execution error
                </span>
                <span className="font-mono text-xs text-haze">{error}</span>
              </div>
            </Panel>
          )}

          {!error && note && (
            <Panel className="flex items-start gap-3 border-amber/30 p-4">
              <Info size={18} className="mt-0.5 shrink-0 text-amber" />
              <span className="text-xs text-haze">{note}</span>
            </Panel>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Panel strong className="relative h-[300px] overflow-hidden p-5">
            <div className="h-full">
              {frame ? (
                <SortingRenderer frame={frame} previous={null} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-haze">
                  Run your code to see it move.
                </div>
              )}
            </div>
          </Panel>

          <Panel className="flex flex-col gap-4 p-5">
            <TimelineScrubber />
            <PlaybackControls />
            <div className="border-t border-white/5 pt-4">
              <Legend />
            </div>
          </Panel>

          <MetricsBar
            metrics={metrics}
            labels={{
              comparisons: 'Reads',
              swaps: 'Writes',
              accesses: 'Accesses',
            }}
          />
        </div>
      </div>
    </div>
  );
};
