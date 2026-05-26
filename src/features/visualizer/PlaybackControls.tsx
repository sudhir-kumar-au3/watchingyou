import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { isAtEnd, isAtStart } from '@/core/timeline/playback';
import { SPEED_OPTIONS, usePlaybackStore } from '@/store/playbackStore';
import { cn } from '@/utils/cn';

export const PlaybackControls = () => {
  const status = usePlaybackStore((state) => state.status);
  const index = usePlaybackStore((state) => state.index);
  const frameCount = usePlaybackStore((state) => state.frameCount);
  const speed = usePlaybackStore((state) => state.speed);
  const toggle = usePlaybackStore((state) => state.toggle);
  const restart = usePlaybackStore((state) => state.restart);
  const stepForward = usePlaybackStore((state) => state.stepForward);
  const stepBackward = usePlaybackStore((state) => state.stepBackward);
  const setSpeed = usePlaybackStore((state) => state.setSpeed);

  const playing = status === 'playing';
  const atStart = isAtStart(index);
  const atEnd = isAtEnd(index, frameCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <IconButton label="Restart" onClick={restart} disabled={atStart}>
          <RotateCcw size={18} />
        </IconButton>
        <IconButton
          label="Step backward"
          onClick={stepBackward}
          disabled={atStart}
        >
          <SkipBack size={18} />
        </IconButton>
        <IconButton
          label={playing ? 'Pause' : 'Play'}
          variant="primary"
          size="lg"
          onClick={toggle}
        >
          {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </IconButton>
        <IconButton
          label="Step forward"
          onClick={stepForward}
          disabled={atEnd}
        >
          <SkipForward size={18} />
        </IconButton>
      </div>

      <div
        className="flex items-center gap-1 rounded-xl glass p-1"
        role="group"
        aria-label="Playback speed"
      >
        {SPEED_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSpeed(option)}
            aria-pressed={speed === option}
            className={cn(
              'rounded-lg px-3 py-1.5 font-mono text-xs transition',
              speed === option
                ? 'bg-cyan/20 text-cyan'
                : 'text-haze hover:text-mist'
            )}
          >
            {option}×
          </button>
        ))}
      </div>
    </div>
  );
};
