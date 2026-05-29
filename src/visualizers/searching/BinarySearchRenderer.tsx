import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { BinarySearchState } from './binarySearch';

const marker = (state: BinarySearchState, i: number): string => {
  const tags: string[] = [];
  if (i === state.lo) tags.push('lo');
  if (i === state.hi) tags.push('hi');
  if (i === state.mid) tags.push('mid');
  return tags.join('·');
};

export const BinarySearchRenderer = ({
  frame,
}: RendererProps<BinarySearchState>) => {
  const state = frame.state;
  const { array, target, lo, hi, mid, foundIndex, done } = state;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-2 font-mono text-sm text-haze">
        target
        <span className="rounded-md border border-cyan/40 bg-cyan/10 px-2.5 py-1 font-semibold text-cyan">
          {target}
        </span>
      </div>
      <div className="flex flex-wrap items-start justify-center gap-1.5">
        {array.map((value, i) => {
          const inRange = i >= lo && i <= hi;
          const found = done && foundIndex === i;
          const tone = found
            ? PALETTE.lime
            : i === mid
              ? PALETTE.amber
              : inRange
                ? PALETTE.cyan
                : PALETTE.idle;
          const filled = found || i === mid;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className="h-3 font-mono text-[9px]"
                style={{ color: i === mid ? PALETTE.amber : PALETTE.cyan }}
              >
                {marker(state, i)}
              </span>
              <motion.div
                animate={{
                  borderColor: tone,
                  backgroundColor: filled ? `${tone}26` : 'transparent',
                  opacity: inRange || found ? 1 : 0.32,
                }}
                className="flex h-11 w-9 items-center justify-center rounded-lg border font-mono text-sm font-semibold text-mist"
              >
                {value}
              </motion.div>
              <span className="font-mono text-[9px] text-haze">{i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
