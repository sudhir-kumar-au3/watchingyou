import { useEffect } from 'react';
import { usePlaybackStore } from '@/store/playbackStore';

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  );
};

export const usePlaybackHotkeys = (): void => {
  useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target)) return;
      const store = usePlaybackStore.getState();
      if (store.frameCount === 0) return;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          store.toggle();
          break;
        case 'ArrowRight':
          event.preventDefault();
          store.stepForward();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          store.stepBackward();
          break;
        default:
          if (event.key === 'r' || event.key === 'R') store.restart();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
};
