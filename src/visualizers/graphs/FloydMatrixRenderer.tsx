import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import { cn } from '@/utils/cn';
import type { FloydState } from './floydWarshall';

const cellStyle = (
  state: FloydState,
  i: number,
  j: number
): { bg: string; border: string } => {
  const { k, i: ai, j: aj, updated } = state;
  const isActive = i === ai && j === aj;
  const isSource = (i === ai && j === k) || (i === k && j === aj);
  const isPivot = i === k || j === k;
  if (isActive) {
    const tone = updated ? PALETTE.lime : PALETTE.cyan;
    return { bg: `${tone}2e`, border: tone };
  }
  if (isSource) return { bg: `${PALETTE.amber}22`, border: PALETTE.amber };
  if (isPivot) return { bg: `${PALETTE.violet}18`, border: 'transparent' };
  return { bg: 'transparent', border: 'transparent' };
};

export const FloydMatrixRenderer = ({ frame }: RendererProps<FloydState>) => {
  const state = frame.state;
  const { labels, dist } = state;
  const n = labels.length;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${n + 1}, minmax(0, 1fr))`, width: 'min(100%, 440px)' }}
      >
        <div />
        {labels.map((label, j) => (
          <div
            key={`col-${j}`}
            className={cn(
              'flex h-9 items-center justify-center font-mono text-xs font-semibold',
              state.k === j ? 'text-violet' : 'text-haze'
            )}
          >
            {label}
          </div>
        ))}

        {labels.map((rowLabel, i) => (
          <div key={`row-${i}`} className="contents">
            <div
              className={cn(
                'flex h-11 items-center justify-center font-mono text-xs font-semibold',
                state.k === i ? 'text-violet' : 'text-haze'
              )}
            >
              {rowLabel}
            </div>
            {labels.map((_, j) => {
              const value = dist[i][j];
              const { bg, border } = cellStyle(state, i, j);
              return (
                <div
                  key={`${i}-${j}`}
                  className="flex h-11 items-center justify-center rounded-lg border font-mono text-sm font-semibold text-mist transition-colors duration-200"
                  style={{ backgroundColor: bg, borderColor: border === 'transparent' ? 'rgba(255,255,255,0.06)' : border }}
                >
                  {value === Infinity ? '∞' : value}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
