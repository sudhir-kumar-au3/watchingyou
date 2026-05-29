import { create } from 'zustand';
import { clampIndex, isAtEnd } from '@/core/timeline/playback';

export type PlaybackStatus = 'idle' | 'playing' | 'paused';

export const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 4] as const;

interface PlaybackState {
  status: PlaybackStatus;
  index: number;
  speed: number;
  frameCount: number;
  soundEnabled: boolean;
  loadTimeline: (frameCount: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  restart: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  seek: (index: number) => void;
  setSpeed: (speed: number) => void;
  toggleSound: () => void;
  advance: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  status: 'idle',
  index: 0,
  speed: 1,
  frameCount: 0,
  soundEnabled: false,

  loadTimeline: (frameCount) =>
    set({ frameCount, index: 0, status: 'idle' }),

  play: () => {
    const { frameCount, index } = get();
    if (frameCount === 0) return;
    if (isAtEnd(index, frameCount)) {
      set({ index: 0, status: 'playing' });
      return;
    }
    set({ status: 'playing' });
  },

  pause: () => set({ status: 'paused' }),

  toggle: () => {
    const { status } = get();
    if (status === 'playing') {
      get().pause();
    } else {
      get().play();
    }
  },

  restart: () => set({ index: 0, status: 'idle' }),

  stepForward: () => {
    const { index, frameCount } = get();
    set({ index: clampIndex(index + 1, frameCount), status: 'paused' });
  },

  stepBackward: () => {
    const { index, frameCount } = get();
    set({ index: clampIndex(index - 1, frameCount), status: 'paused' });
  },

  seek: (next) => {
    const { frameCount } = get();
    set({ index: clampIndex(next, frameCount) });
  },

  setSpeed: (speed) => set({ speed }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  advance: () => {
    const { index, frameCount } = get();
    if (isAtEnd(index, frameCount)) {
      set({ status: 'paused' });
      return;
    }
    set({ index: clampIndex(index + 1, frameCount) });
  },
}));
