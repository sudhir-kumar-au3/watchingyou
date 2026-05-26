import type { Frame, Timeline, TimelineMetrics } from './types';

export class TimelineRecorder<TState> {
  private readonly frames: Frame<TState>[] = [];
  private readonly metrics: TimelineMetrics = {
    comparisons: 0,
    swaps: 0,
    accesses: 0,
  };

  countComparison(amount = 1): void {
    this.metrics.comparisons += amount;
  }

  countSwap(amount = 1): void {
    this.metrics.swaps += amount;
  }

  countAccess(amount = 1): void {
    this.metrics.accesses += amount;
  }

  capture(
    state: TState,
    description: string,
    highlightedLines: number[] = []
  ): void {
    this.frames.push({
      state: structuredClone(state),
      description,
      highlightedLines,
      metrics: { ...this.metrics },
    });
  }

  build(): Timeline<TState> {
    return { frames: this.frames };
  }
}
