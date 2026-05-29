import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { FactorState } from './factorize';

export const FactorizeRenderer = ({ frame }: RendererProps<FactorState>) => {
  const { original, remaining, divisor, factors, done } = frame.state;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <div className="flex min-h-[2.5rem] flex-wrap items-center justify-center gap-2">
        {factors.length === 0 ? (
          <span className="font-mono text-xs text-haze/50">no factors yet</span>
        ) : (
          factors.map((factor, i) => (
            <motion.span
              key={`${factor}-${i}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-lg border border-lime/40 bg-lime/10 px-3 py-1.5 font-mono text-sm font-semibold text-lime"
            >
              {factor}
            </motion.span>
          ))
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wide text-haze">
          {done ? 'done' : 'remaining'}
        </span>
        <motion.span
          key={remaining}
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          className="font-mono text-4xl font-bold tabular-nums"
          style={{ color: done ? PALETTE.lime : PALETTE.cyan }}
        >
          {done ? original : remaining}
        </motion.span>
        {!done && divisor !== null && (
          <span className="font-mono text-sm text-haze">
            testing divisor{' '}
            <span className="font-semibold text-amber">{divisor}</span>
          </span>
        )}
        {done && (
          <span className="font-mono text-sm text-haze">
            = {factors.length > 0 ? factors.join(' × ') : '1'}
          </span>
        )}
      </div>
    </div>
  );
};
