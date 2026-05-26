export interface TimelineMetrics {
  comparisons: number;
  swaps: number;
  accesses: number;
}

export interface Frame<TState> {
  state: TState;
  description: string;
  highlightedLines: number[];
  metrics: TimelineMetrics;
}

export interface Timeline<TState> {
  frames: Frame<TState>[];
}

export const EMPTY_METRICS: TimelineMetrics = {
  comparisons: 0,
  swaps: 0,
  accesses: 0,
};
