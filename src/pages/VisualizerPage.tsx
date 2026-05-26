import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Panel';
import { CodePanel } from '@/features/visualizer/CodePanel';
import { DatasetControls } from '@/features/visualizer/DatasetControls';
import { InfoPanel } from '@/features/visualizer/InfoPanel';
import { MetricsBar } from '@/features/visualizer/MetricsBar';
import { PlaybackControls } from '@/features/visualizer/PlaybackControls';
import { TimelineScrubber } from '@/features/visualizer/TimelineScrubber';
import { usePlaybackEngine } from '@/hooks/usePlaybackEngine';
import { usePlaybackStore } from '@/store/playbackStore';
import { allModules, getModuleById } from '@/visualizers/registry';
import { randomArray } from '@/visualizers/sorting/types';
import { EMPTY_METRICS } from '@/core/timeline/types';
import { NotFoundPage } from './NotFoundPage';
import { cn } from '@/utils/cn';

const MIN_SIZE = 6;
const MAX_SIZE = 40;

export const VisualizerPage = () => {
  const { id } = useParams<{ id: string }>();
  const visual = id ? getModuleById(id) : undefined;

  const [input, setInput] = useState<number[]>([]);
  const index = usePlaybackStore((state) => state.index);
  const loadTimeline = usePlaybackStore((state) => state.loadTimeline);

  usePlaybackEngine();

  useEffect(() => {
    if (visual) setInput(visual.algorithm.createDefaultInput());
  }, [visual]);

  const timeline = useMemo(() => {
    if (!visual || input.length === 0) return null;
    return visual.algorithm.generate(input);
  }, [visual, input]);

  useEffect(() => {
    if (timeline) loadTimeline(timeline.frames.length);
  }, [timeline, loadTimeline]);

  if (!visual) return <NotFoundPage />;

  const { algorithm, Renderer } = visual;
  const frames = timeline?.frames ?? [];
  const safeIndex = Math.min(index, Math.max(frames.length - 1, 0));
  const frame = frames[safeIndex] ?? null;
  const previous = safeIndex > 0 ? (frames[safeIndex - 1] ?? null) : null;
  const metrics = frame?.metrics ?? EMPTY_METRICS;
  const size = input.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 text-sm text-haze transition hover:text-cyan"
        >
          <ArrowLeft size={16} />
          All visualizers
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl font-bold text-mist">
              {algorithm.name}
            </h1>
            <p className="max-w-xl text-sm text-haze">{algorithm.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge accent={algorithm.accent}>{algorithm.category}</Badge>
            <Badge>avg {algorithm.info.complexity.timeAverage}</Badge>
            <Badge>space {algorithm.info.complexity.space}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {allModules.map((entry) => {
            const active = entry.algorithm.id === algorithm.id;
            return (
              <Link
                key={entry.algorithm.id}
                to={`/algorithm/${entry.algorithm.id}`}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-sm transition',
                  active
                    ? 'bg-cyan/15 text-cyan'
                    : 'glass text-haze hover:text-mist'
                )}
              >
                {entry.algorithm.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-5">
          <Panel strong className="relative h-[440px] overflow-hidden p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={frame?.description ?? 'empty'}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="absolute left-5 right-5 top-5 z-10"
              >
                <span className="inline-block rounded-lg bg-black/40 px-3 py-1.5 font-mono text-xs text-mist backdrop-blur">
                  {frame?.description ?? 'Preparing timeline…'}
                </span>
              </motion.div>
            </AnimatePresence>
            <div className="h-full pt-10">
              {frame && <Renderer frame={frame} previous={previous} />}
            </div>
          </Panel>

          <Panel className="flex flex-col gap-4 p-5">
            <TimelineScrubber />
            <PlaybackControls />
          </Panel>

          <MetricsBar metrics={metrics} />
        </div>

        <div className="flex flex-col gap-5">
          <Panel className="flex flex-col gap-4 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-haze">
              Dataset
            </h3>
            <DatasetControls
              size={size}
              minSize={MIN_SIZE}
              maxSize={MAX_SIZE}
              onSizeChange={(next) => setInput(randomArray(next))}
              onShuffle={() => setInput(randomArray(size))}
              onCustom={(values) => setInput(values)}
            />
          </Panel>

          <Panel className="flex flex-col gap-3 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-haze">
              Source
            </h3>
            <CodePanel
              sourceCode={algorithm.sourceCode}
              highlightedLines={frame?.highlightedLines ?? []}
            />
          </Panel>
        </div>
      </div>

      <Panel className="p-6">
        <InfoPanel info={algorithm.info} />
      </Panel>
    </div>
  );
};
