import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { FastPowState } from './fastPow';

export const FastPowRenderer = ({ frame }: RendererProps<FastPowState>) => {
  const { base, exp, bits, bitIndex, used, result, currentBase, done } = frame.state;
  const display = [...bits].reverse();
  const len = bits.length;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-xs text-haze">
          {base}^{exp} · exponent in binary
        </span>
        <div className="flex gap-1.5">
          {display.map((bit, d) => {
            const lsb = len - 1 - d;
            const active = lsb === bitIndex;
            const color = active ? (used ? PALETTE.lime : PALETTE.cyan) : PALETTE.idle;
            return (
              <motion.div
                key={d}
                animate={{
                  borderColor: color,
                  backgroundColor: active ? `${color}2e` : 'transparent',
                  scale: active ? 1.1 : 1,
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-sm font-semibold text-mist"
              >
                {bit}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[11px] uppercase tracking-wide text-haze">
            base now
          </span>
          <span className="font-mono text-lg font-semibold text-amber tabular-nums">
            {currentBase}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[11px] uppercase tracking-wide text-haze">
            result
          </span>
          <motion.span
            key={result}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            className="font-mono text-2xl font-bold tabular-nums"
            style={{ color: done ? PALETTE.lime : PALETTE.cyan }}
          >
            {result}
          </motion.span>
        </div>
      </div>
    </div>
  );
};
