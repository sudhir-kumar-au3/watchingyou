import { useEffect, useRef } from 'react';
import { usePlaybackStore } from '@/store/playbackStore';
import { frameTones } from '@/core/audio/frameTones';
import { sonifier } from '@/core/audio/sonifier';

export const useSonifier = (state: unknown): void => {
  const index = usePlaybackStore((store) => store.index);
  const enabled = usePlaybackStore((store) => store.soundEnabled);
  const previous = useRef(index);

  useEffect(() => {
    if (!enabled || index === previous.current) {
      previous.current = index;
      return;
    }
    previous.current = index;
    const tones = frameTones(state);
    if (tones) sonifier.playValues(tones.values, tones.max);
  }, [index, enabled, state]);
};
