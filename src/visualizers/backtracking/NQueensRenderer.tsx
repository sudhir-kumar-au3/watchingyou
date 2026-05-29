import { Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import { cn } from '@/utils/cn';
import type { NQueensState } from './nqueens';

export const NQueensRenderer = ({ frame }: RendererProps<NQueensState>) => {
  const { n, queens, activeRow, tryCol, rejected, solved } = frame.state;
  const cells = Array.from({ length: n * n }, (_, i) => i);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="grid aspect-square w-full max-w-[min(100%,420px)] gap-1 rounded-xl p-1"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {cells.map((index) => {
          const row = Math.floor(index / n);
          const col = index % n;
          const hasQueen = queens[row] === col;
          const isActive = row === activeRow && tryCol === col;
          const dark = (row + col) % 2 === 1;
          const queenColor = solved ? PALETTE.lime : PALETTE.cyan;
          const ring = isActive
            ? rejected
              ? PALETTE.rose
              : PALETTE.cyan
            : 'transparent';
          return (
            <div
              key={index}
              className={cn(
                'relative flex items-center justify-center rounded-md',
                dark ? 'bg-white/[0.03]' : 'bg-white/[0.07]'
              )}
              style={{ boxShadow: `inset 0 0 0 1.5px ${ring}` }}
            >
              {hasQueen && (
                <motion.div
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    filter: `drop-shadow(0 0 6px ${queenColor})`,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Crown
                    size={Math.max(12, Math.round(160 / n))}
                    style={{ color: queenColor }}
                    fill={queenColor}
                  />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
