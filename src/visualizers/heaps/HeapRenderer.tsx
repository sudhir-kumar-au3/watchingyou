import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { HeapState } from './types';

const inHeapColor = (state: HeapState, i: number): string => {
  if (state.swapped.includes(i)) return PALETTE.rose;
  if (state.comparing.includes(i)) return PALETTE.amber;
  if (state.active === i) return PALETTE.cyan;
  return PALETTE.idle;
};

const cellColor = (state: HeapState, i: number): string =>
  i >= state.size ? PALETTE.lime : inHeapColor(state, i);

const nodePosition = (i: number, maxLevel: number): { x: number; y: number } => {
  const level = Math.floor(Math.log2(i + 1));
  const start = 2 ** level - 1;
  const countInLevel = 2 ** level;
  const x = ((i - start + 0.5) / countInLevel) * 100;
  const y = 12 + level * (74 / Math.max(maxLevel, 1));
  return { x, y };
};

export const HeapRenderer = ({ frame }: RendererProps<HeapState>) => {
  const state = frame.state;
  const n = state.values.length;
  const maxLevel = Math.floor(Math.log2(Math.max(n, 1)));
  const treeIndices = state.values
    .map((_, i) => i)
    .filter((i) => i < state.size);

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="relative min-h-0 flex-1">
        <svg
          viewBox="0 0 100 100"
          className="h-full max-h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {treeIndices.map((i) => {
            if (i === 0) return null;
            const parent = Math.floor((i - 1) / 2);
            if (parent >= state.size) return null;
            const a = nodePosition(parent, maxLevel);
            const b = nodePosition(i, maxLevel);
            return (
              <motion.line
                key={`edge-${i}`}
                animate={{ x1: a.x, y1: a.y, x2: b.x, y2: b.y }}
                stroke="#232a52"
                strokeWidth={0.7}
                strokeLinecap="round"
              />
            );
          })}
          {treeIndices.map((i) => {
            const { x, y } = nodePosition(i, maxLevel);
            const color = inHeapColor(state, i);
            return (
              <g key={`node-${i}`}>
                <motion.circle
                  animate={{
                    cx: x,
                    cy: y,
                    fill: color,
                    filter: `drop-shadow(0 0 ${color === PALETTE.idle ? 0 : 3}px ${color})`,
                  }}
                  r={5}
                  stroke={PALETTE.void}
                  strokeWidth={0.6}
                />
                <motion.text
                  animate={{ x, y: y + 1.5 }}
                  textAnchor="middle"
                  className="font-mono"
                  style={{ fontSize: 3.4, fill: PALETTE.void, fontWeight: 700 }}
                >
                  {state.values[i]}
                </motion.text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {state.values.map((value, i) => {
          const color = cellColor(state, i);
          const sorted = i >= state.size;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <motion.div
                animate={{
                  backgroundColor: `${color}26`,
                  borderColor: color,
                  color: sorted ? PALETTE.lime : '#e6e9ff',
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-sm font-semibold tabular-nums"
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
