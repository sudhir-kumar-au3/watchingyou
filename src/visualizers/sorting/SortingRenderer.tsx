import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { TONE_COLOR, TONE_GLOW, type BarTone } from '@/themes/palette';
import type { SortState } from './types';

const resolveTone = (state: SortState, index: number): BarTone => {
  if (state.swapping.includes(index)) return 'swap';
  if (state.comparing.includes(index)) return 'compare';
  if (state.pivot === index) return 'pivot';
  if (state.sorted.includes(index)) return 'sorted';
  return 'idle';
};

export const SortingRenderer = ({ frame }: RendererProps<SortState>) => {
  const { array } = frame.state;
  const max = Math.max(...array, 1);
  const showLabels = array.length <= 28;

  return (
    <div className="flex h-full w-full items-end justify-center gap-[3px] px-2 pb-2">
      {array.map((value, index) => {
        const tone = resolveTone(frame.state, index);
        return (
          <motion.div
            key={index}
            layout
            className="relative flex flex-1 flex-col items-center justify-end"
            style={{ maxWidth: 56 }}
          >
            <motion.div
              className="w-full rounded-t-md"
              animate={{
                height: `${(value / max) * 100}%`,
                backgroundColor: TONE_COLOR[tone],
                boxShadow: `0 0 16px ${TONE_GLOW[tone]}`,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            />
            {showLabels && (
              <span className="mt-1.5 font-mono text-[10px] text-haze">
                {value}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
