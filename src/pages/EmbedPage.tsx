import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { PlaybackControls } from '@/features/visualizer/PlaybackControls';
import { TimelineScrubber } from '@/features/visualizer/TimelineScrubber';
import { usePlaybackEngine } from '@/hooks/usePlaybackEngine';
import { usePlaybackStore } from '@/store/playbackStore';
import { getModuleById } from '@/visualizers/registry';
import { decodeState } from '@/utils/share';

export const EmbedPage = () => {
  const { id } = useParams<{ id: string }>();
  const visual = id ? getModuleById(id) : undefined;
  const [searchParams] = useSearchParams();
  const index = usePlaybackStore((state) => state.index);
  const loadTimeline = usePlaybackStore((state) => state.loadTimeline);
  const play = usePlaybackStore((state) => state.play);
  usePlaybackEngine();

  const input = useMemo(() => {
    if (!visual) return null;
    return (
      decodeState<unknown>(searchParams.get('d')) ??
      visual.algorithm.createDefaultInput()
    );
  }, [visual, searchParams]);

  const timeline = useMemo(() => {
    if (!visual || input === null) return null;
    return visual.algorithm.generate(input);
  }, [visual, input]);

  useEffect(() => {
    if (timeline) {
      loadTimeline(timeline.frames.length);
      play();
    }
  }, [timeline, loadTimeline, play]);

  if (!visual) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-haze">
        Unknown algorithm.
      </div>
    );
  }

  const { algorithm, Renderer } = visual;
  const frames = timeline?.frames ?? [];
  const safeIndex = Math.min(index, Math.max(frames.length - 1, 0));
  const frame = frames[safeIndex] ?? null;
  const fullUrl = `${window.location.origin}${window.location.pathname}#/algorithm/${algorithm.id}`;

  return (
    <div className="flex h-screen flex-col gap-2 p-3">
      <div className="flex items-center justify-between px-1">
        <span className="font-display text-sm font-semibold text-mist">
          {algorithm.name}
        </span>
        <a
          href={fullUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[11px] text-haze transition hover:text-cyan"
        >
          WatchingYou
          <ArrowUpRight size={12} />
        </a>
      </div>

      <Panel strong className="relative min-h-0 flex-1 overflow-hidden p-4">
        <span className="absolute left-3 right-3 top-3 z-10 inline-block truncate rounded-lg bg-black/40 px-2.5 py-1 font-mono text-[11px] text-mist backdrop-blur">
          {frame?.description ?? 'Loading…'}
        </span>
        <div className="h-full pt-8">
          {frame && <Renderer frame={frame} previous={null} />}
        </div>
      </Panel>

      <Panel className="flex flex-col gap-3 p-3">
        <TimelineScrubber />
        <PlaybackControls />
      </Panel>
    </div>
  );
};
