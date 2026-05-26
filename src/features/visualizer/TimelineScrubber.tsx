import type { ChangeEvent } from 'react';
import { usePlaybackStore } from '@/store/playbackStore';

export const TimelineScrubber = () => {
  const index = usePlaybackStore((state) => state.index);
  const frameCount = usePlaybackStore((state) => state.frameCount);
  const seek = usePlaybackStore((state) => state.seek);

  const lastFrame = Math.max(frameCount - 1, 0);
  const percent = lastFrame === 0 ? 0 : (index / lastFrame) * 100;

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    seek(Number(event.target.value));
  };

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-haze tabular-nums">
        {String(index).padStart(3, '0')}
      </span>
      <input
        type="range"
        min={0}
        max={lastFrame}
        value={index}
        onChange={onChange}
        aria-label="Timeline position"
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
        style={{
          background: `linear-gradient(to right, var(--color-cyan) ${percent}%, var(--color-edge) ${percent}%)`,
        }}
      />
      <span className="font-mono text-xs text-haze tabular-nums">
        {String(lastFrame).padStart(3, '0')}
      </span>
    </div>
  );
};
