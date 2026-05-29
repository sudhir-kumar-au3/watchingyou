import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Panel';
import { CodePanel } from '@/features/visualizer/CodePanel';
import { InfoPanel } from '@/features/visualizer/InfoPanel';
import { MetricsBar } from '@/features/visualizer/MetricsBar';
import { PlaybackControls } from '@/features/visualizer/PlaybackControls';
import { TimelineScrubber } from '@/features/visualizer/TimelineScrubber';
import { usePlaybackEngine } from '@/hooks/usePlaybackEngine';
import { useSonifier } from '@/hooks/useSonifier';
import { usePlaybackStore } from '@/store/playbackStore';
import { allModules, getModuleById } from '@/visualizers/registry';
import { EMPTY_METRICS } from '@/core/timeline/types';
import { NotFoundPage } from './NotFoundPage';
import { cn } from '@/utils/cn';
import { copyText, decodeState, encodeState } from '@/utils/share';

export const VisualizerPage = () => {
  const { id } = useParams<{ id: string }>();
  const visual = id ? getModuleById(id) : undefined;

  const [searchParams] = useSearchParams();
  const [session, setSession] = useState<{ id: string; input: unknown } | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const pendingStep = useRef<number | null>(null);
  const index = usePlaybackStore((state) => state.index);
  const loadTimeline = usePlaybackStore((state) => state.loadTimeline);
  const seek = usePlaybackStore((state) => state.seek);

  usePlaybackEngine();

  useEffect(() => {
    if (!visual) return;
    const shared = decodeState<unknown>(searchParams.get('d'));
    const stepParam = searchParams.get('i');
    pendingStep.current = stepParam !== null ? Number(stepParam) : null;
    setSession({
      id: visual.algorithm.id,
      input: shared ?? visual.algorithm.createDefaultInput(),
    });
  }, [visual, searchParams]);

  const input =
    visual && session && session.id === visual.algorithm.id
      ? session.input
      : null;

  const setInput = (next: unknown): void => {
    if (visual) setSession({ id: visual.algorithm.id, input: next });
  };

  const timeline = useMemo(() => {
    if (!visual || input === null) return null;
    return visual.algorithm.generate(input);
  }, [visual, input]);

  useEffect(() => {
    if (timeline) loadTimeline(timeline.frames.length);
  }, [timeline, loadTimeline]);

  useEffect(() => {
    if (timeline && pendingStep.current !== null) {
      seek(pendingStep.current);
      pendingStep.current = null;
    }
  }, [timeline, seek]);

  const liveState = useMemo(() => {
    const list = timeline?.frames ?? [];
    const safe = Math.min(index, Math.max(list.length - 1, 0));
    return list[safe]?.state ?? null;
  }, [timeline, index]);
  useSonifier(liveState);

  const share = async (): Promise<void> => {
    if (!visual || input === null) return;
    const base = window.location.href.split('#')[0];
    const url = `${base}#/algorithm/${visual.algorithm.id}?d=${encodeState(input)}&i=${index}`;
    const ok = await copyText(url);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  if (!visual) return <NotFoundPage />;

  const { algorithm, Renderer, Controls, Legend } = visual;
  const frames = timeline?.frames ?? [];
  const safeIndex = Math.min(index, Math.max(frames.length - 1, 0));
  const frame = frames[safeIndex] ?? null;
  const previous = safeIndex > 0 ? (frames[safeIndex - 1] ?? null) : null;
  const metrics = frame?.metrics ?? EMPTY_METRICS;

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
          <div className="flex flex-wrap items-center gap-2">
            <Badge accent={algorithm.accent}>{algorithm.category}</Badge>
            <Badge>avg {algorithm.info.complexity.timeAverage}</Badge>
            <Badge>space {algorithm.info.complexity.space}</Badge>
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-haze transition hover:border-cyan/50 hover:text-cyan"
            >
              {copied ? <Check size={13} /> : <Share2 size={13} />}
              {copied ? 'Copied!' : 'Share'}
            </button>
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
        <div className="flex min-w-0 flex-col gap-5">
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
            {Legend && (
              <div className="border-t border-white/5 pt-4">
                <Legend />
              </div>
            )}
          </Panel>

          <MetricsBar metrics={metrics} labels={algorithm.metricLabels} />
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          {Controls && input !== null && (
            <Panel className="flex flex-col gap-4 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-haze">
                Setup
              </h3>
              <Controls input={input} onChange={setInput} />
            </Panel>
          )}

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
