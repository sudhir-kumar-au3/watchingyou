import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { PermState } from './permutations';

export const PermutationsRenderer = ({ frame }: RendererProps<PermState>) => {
  const { items, current, used, results, active } = frame.state;

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-16 text-right font-mono text-[11px] uppercase tracking-wide text-haze">
            building
          </span>
          {items.map((_, slot) => (
            <div
              key={slot}
              className="flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-sm font-semibold text-cyan"
              style={{
                borderColor: current[slot] !== undefined ? PALETTE.cyan : 'rgba(255,255,255,0.08)',
                backgroundColor: current[slot] !== undefined ? `${PALETTE.cyan}22` : 'transparent',
              }}
            >
              {current[slot] ?? ''}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-right font-mono text-[11px] uppercase tracking-wide text-haze">
            pool
          </span>
          {items.map((item, i) => (
            <motion.div
              key={i}
              animate={{ opacity: used[i] ? 0.25 : 1, scale: active === i ? 1.12 : 1 }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] font-mono text-sm font-semibold text-mist"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-black/20 p-3">
        <div className="flex flex-wrap gap-2">
          {results.map((perm, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-md border border-lime/30 bg-lime/10 px-2 py-1 font-mono text-xs text-lime"
            >
              {perm.join('')}
            </motion.span>
          ))}
          {results.length === 0 && (
            <span className="font-mono text-xs text-haze/50">
              completed permutations appear here…
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
