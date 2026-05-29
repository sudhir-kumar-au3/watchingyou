import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { GcdState } from './gcd';

const Bar = ({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) => (
  <div className="flex w-full items-center gap-3">
    <span className="w-6 shrink-0 text-right font-mono text-xs text-haze">
      {label}
    </span>
    <div className="relative h-9 flex-1 overflow-hidden rounded-lg bg-white/[0.04]">
      <motion.div
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        className="flex h-full items-center justify-end rounded-lg pr-2 font-mono text-sm font-semibold text-void"
        style={{ backgroundColor: color, boxShadow: `0 0 14px ${color}66` }}
      >
        {value > 0 ? value : ''}
      </motion.div>
    </div>
  </div>
);

export const GcdRenderer = ({ frame }: RendererProps<GcdState>) => {
  const { a, b, remainder, max, done } = frame.state;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-4">
      <div className="flex w-full max-w-md flex-col gap-3">
        <Bar label="a" value={a} max={max} color={done ? PALETTE.lime : PALETTE.cyan} />
        <Bar label="b" value={b} max={max} color={PALETTE.amber} />
      </div>
      <div className="font-mono text-sm text-haze">
        {done ? (
          <span className="text-lime">gcd = {a}</span>
        ) : remainder !== null ? (
          <span>
            remainder ={' '}
            <span className="text-mist">{remainder}</span>
          </span>
        ) : (
          <span>reducing…</span>
        )}
      </div>
    </div>
  );
};
