import { useEffect } from 'react';
import { usePlaybackStore } from '@/store/playbackStore';

const BASE_INTERVAL_MS = 360;

export const usePlaybackEngine = (): void => {
  const status = usePlaybackStore((state) => state.status);
  const speed = usePlaybackStore((state) => state.speed);
  const advance = usePlaybackStore((state) => state.advance);

  useEffect(() => {
    if (status !== 'playing') return;
    const interval = window.setInterval(advance, BASE_INTERVAL_MS / speed);
    return () => window.clearInterval(interval);
  }, [status, speed, advance]);
};
