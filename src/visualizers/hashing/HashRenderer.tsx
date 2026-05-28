import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import { cn } from '@/utils/cn';
import type { HashState } from './hashTable';

const ChainingView = ({ state }: { state: HashState }) => (
  <div className="flex h-full w-full flex-col gap-1.5 overflow-auto pr-1">
    {state.buckets.map((bucket, i) => {
      const activeRow = state.activeBucket === i;
      return (
        <div key={i} className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border font-mono text-xs',
              activeRow
                ? 'border-cyan/70 text-cyan'
                : 'border-white/10 text-haze'
            )}
          >
            {i}
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
            {bucket.length === 0 && (
              <span className="font-mono text-xs text-haze/40">∅</span>
            )}
            {bucket.map((value, j) => {
              const justPlaced =
                state.placedAt === i &&
                state.inserting === value &&
                j === bucket.length - 1;
              const color = justPlaced
                ? PALETTE.cyan
                : activeRow && state.collision
                  ? PALETTE.amber
                  : PALETTE.idle;
              return (
                <div key={j} className="flex shrink-0 items-center gap-1.5">
                  {j > 0 && <span className="text-xs text-haze">→</span>}
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      borderColor: color,
                      backgroundColor: `${color}1f`,
                    }}
                    className="flex h-8 min-w-[2.2rem] items-center justify-center rounded-md border px-2 font-mono text-sm font-semibold text-mist"
                  >
                    {value}
                  </motion.span>
                </div>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

const LinearView = ({ state }: { state: HashState }) => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-4">
    <div className="flex flex-wrap items-start justify-center gap-1.5">
      {state.buckets.map((bucket, i) => {
        const value = bucket[0];
        const filled = value !== undefined;
        const isHome = state.home === i;
        const placed = state.placedAt === i;
        const probingHere = state.activeBucket === i && state.collision;
        const color = placed
          ? PALETTE.cyan
          : probingHere
            ? PALETTE.amber
            : filled
              ? PALETTE.idle
              : '#171c3a';
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="relative">
              {isHome && (
                <span className="absolute -inset-1 rounded-xl border border-rose/60" />
              )}
              <motion.div
                animate={{
                  borderColor: color,
                  backgroundColor: `${color}1f`,
                }}
                className="flex h-11 w-11 items-center justify-center rounded-lg border font-mono text-sm font-semibold text-mist"
              >
                {filled ? value : ''}
              </motion.div>
            </div>
            <span className="font-mono text-[9px] text-haze">{i}</span>
          </div>
        );
      })}
    </div>
    <span className="font-mono text-[11px] text-haze">
      ring = home slot (key mod size) · forward probing fills the next free slot
    </span>
  </div>
);

export const HashRenderer = ({ frame }: RendererProps<HashState>) => {
  const state = frame.state;
  return state.strategy === 'chaining' ? (
    <ChainingView state={state} />
  ) : (
    <LinearView state={state} />
  );
};
