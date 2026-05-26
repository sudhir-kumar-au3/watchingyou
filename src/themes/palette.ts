export const PALETTE = {
  void: '#05060f',
  cyan: '#22d3ee',
  violet: '#a855f7',
  lime: '#a3e635',
  rose: '#fb7185',
  amber: '#fbbf24',
  idle: '#2c356b',
} as const;

export type BarTone = 'idle' | 'compare' | 'swap' | 'sorted' | 'pivot';

export const TONE_COLOR: Record<BarTone, string> = {
  idle: PALETTE.idle,
  compare: PALETTE.cyan,
  swap: PALETTE.rose,
  sorted: PALETTE.lime,
  pivot: PALETTE.violet,
};

export const TONE_GLOW: Record<BarTone, string> = {
  idle: 'transparent',
  compare: 'rgb(34 211 238 / 0.55)',
  swap: 'rgb(251 113 133 / 0.6)',
  sorted: 'rgb(163 230 53 / 0.45)',
  pivot: 'rgb(168 85 247 / 0.6)',
};
