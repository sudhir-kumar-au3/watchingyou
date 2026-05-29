import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { WindowState } from './slidingWindow';

const Chip = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <span className="flex items-center gap-2 font-mono text-sm text-haze">
    {label}
    <span
      className="rounded-md px-2.5 py-1 font-semibold"
      style={{ color, border: `1px solid ${color}66`, background: `${color}14` }}
    >
      {value}
    </span>
  </span>
);

export const SlidingWindowRenderer = ({ frame }: RendererProps<WindowState>) => {
  const { array, target, left, right, sum, best, bestRange, phase } = frame.state;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Chip label="target" value={`≥ ${target}`} color={PALETTE.cyan} />
        <Chip label="window sum" value={String(sum)} color={PALETTE.amber} />
        <Chip
          label="shortest"
          value={best > 0 ? `${best}` : '—'}
          color={PALETTE.lime}
        />
      </div>
      <div className="flex flex-wrap items-end justify-center gap-1.5">
        {array.map((value, i) => {
          const inWindow = right >= 0 && i >= left && i <= right;
          const inBest = bestRange ? i >= bestRange[0] && i <= bestRange[1] : false;
          const tone = inWindow ? PALETTE.cyan : PALETTE.idle;
          const dimmed = phase === 'done' && !inBest;
          return (
            <motion.div
              key={i}
              animate={{
                borderColor: tone,
                backgroundColor: inWindow ? `${PALETTE.cyan}1f` : 'transparent',
                opacity: dimmed ? 0.32 : 1,
                boxShadow: inBest ? `inset 0 0 0 2px ${PALETTE.lime}` : 'none',
              }}
              className="flex h-12 w-9 items-center justify-center rounded-lg border font-mono text-sm font-semibold text-mist"
            >
              {value}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
