import { useCallback, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { AlertTriangle, Play, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Panel } from '@/components/ui/Panel';
import { CodePanel } from '@/features/visualizer/CodePanel';
import { PlaybackControls } from '@/features/visualizer/PlaybackControls';
import { TimelineScrubber } from '@/features/visualizer/TimelineScrubber';
import { usePlaybackEngine } from '@/hooks/usePlaybackEngine';
import { usePlaybackStore } from '@/store/playbackStore';
import { runProgram } from '@/core/interpreter/runProgram';
import type { Timeline } from '@/core/timeline/types';
import type { ProgramState } from '@/core/interpreter/types';
import { createProgramState } from '@/core/interpreter/types';
import { CodeStateRenderer } from '@/visualizers/code/CodeStateRenderer';

const STARTER_CODE = `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
      }
    }
  }
  return arr;
}

let data = [5, 2, 8, 1, 9];
let sorted = bubbleSort(data);
console.log("sorted:", sorted);`;

export const PlaygroundPage = () => {
  const [code, setCode] = useState(STARTER_CODE);
  const [timeline, setTimeline] = useState<Timeline<ProgramState> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const index = usePlaybackStore((state) => state.index);
  const loadTimeline = usePlaybackStore((state) => state.loadTimeline);
  const play = usePlaybackStore((state) => state.play);
  usePlaybackEngine();

  const run = useCallback(() => {
    const result = runProgram(code);
    setError(result.error);
    setTimeline(result.timeline);
    if (result.timeline) {
      loadTimeline(result.timeline.frames.length);
      play();
    }
  }, [code, loadTimeline, play]);

  useEffect(() => {
    run();
  }, [run]);

  const frames = timeline?.frames ?? [];
  const safeIndex = Math.min(index, Math.max(frames.length - 1, 0));
  const frame = frames[safeIndex] ?? null;
  const state = frame?.state ?? createProgramState();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-cyan">Code playground</span>
        <h1 className="font-display text-3xl font-bold text-mist">
          Step through any JavaScript
        </h1>
        <p className="max-w-2xl text-sm text-haze">
          Write JavaScript and watch it execute one step at a time — variables,
          arrays, the call stack, recursion depth, and console output update
          live as the highlighted line runs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Panel strong className="overflow-hidden p-0">
            <Editor
              height="420px"
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
              Run & step
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
              runs in your browser · 15k-step safety limit
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

          <Panel className="flex flex-col gap-3 p-4">
            <AnimatePresence mode="wait">
              <motion.span
                key={frame?.description ?? 'idle'}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-xs text-mist"
              >
                {frame?.description ?? 'Run to begin.'}
              </motion.span>
            </AnimatePresence>
            <div className="max-h-[220px] overflow-auto">
              <CodePanel
                sourceCode={code}
                highlightedLines={state.line ? [state.line] : []}
              />
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <Panel className="flex flex-col gap-4 p-5">
            <TimelineScrubber />
            <PlaybackControls />
          </Panel>

          <Panel strong className="h-[520px] p-5">
            <CodeStateRenderer state={state} />
          </Panel>
        </div>
      </div>
    </div>
  );
};
