import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { HanoiState } from './hanoi';

const DISK_COLORS = [
  PALETTE.cyan,
  PALETTE.violet,
  PALETTE.lime,
  PALETTE.amber,
  PALETTE.rose,
  '#38bdf8',
  '#f472b6',
];

const PEG_NAMES = ['A', 'B', 'C'];

export const HanoiRenderer = ({ frame }: RendererProps<HanoiState>) => {
  const { pegs, moving, numDisks } = frame.state;

  return (
    <div className="flex h-full w-full items-end justify-center gap-4 px-2 pb-6">
      {pegs.map((peg, pegIndex) => (
        <div key={pegIndex} className="flex flex-1 flex-col items-center gap-2">
          <div className="relative flex w-full flex-col-reverse items-center gap-1" style={{ minHeight: numDisks * 24 }}>
            <span className="absolute -bottom-6 font-mono text-xs text-haze">
              {PEG_NAMES[pegIndex]}
            </span>
            <div className="absolute bottom-0 top-0 w-1 rounded bg-white/10" />
            {peg.map((disk) => {
              const color = DISK_COLORS[(disk - 1) % DISK_COLORS.length];
              const isMoving = moving === disk;
              return (
                <motion.div
                  key={disk}
                  layout
                  animate={{
                    backgroundColor: color,
                    boxShadow: isMoving ? `0 0 16px ${color}` : `0 0 6px ${color}55`,
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="z-10 flex h-5 items-center justify-center rounded-md font-mono text-[10px] font-bold text-void"
                  style={{ width: `${30 + (disk / numDisks) * 65}%` }}
                >
                  {disk}
                </motion.div>
              );
            })}
          </div>
          <div className="h-1 w-full rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
};
