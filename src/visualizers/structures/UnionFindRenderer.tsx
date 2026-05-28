import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { UnionFindState } from './unionFind';

const COLOR_CYCLE = [
  PALETTE.cyan,
  PALETTE.violet,
  PALETTE.lime,
  PALETTE.amber,
  PALETTE.rose,
  '#34d399',
  '#38bdf8',
  '#f472b6',
];

const rootOf = (parent: number[], x: number): number => {
  let r = x;
  while (parent[r] !== r) r = parent[r];
  return r;
};

export const UnionFindRenderer = ({ frame }: RendererProps<UnionFindState>) => {
  const { parent, rank, highlight, activePair, compressed } = frame.state;
  const n = parent.length;
  const roots = [...new Set(parent.map((_, i) => rootOf(parent, i)))].sort(
    (a, b) => a - b
  );
  const colorOf = (i: number): string =>
    COLOR_CYCLE[roots.indexOf(rootOf(parent, i)) % COLOR_CYCLE.length];
  const xOf = (i: number): number => ((i + 0.5) / n) * 100;
  const Y = 82;
  const highlightSet = new Set(highlight);
  const compressedSet = new Set(compressed);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="h-full max-h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {parent.map((p, i) => {
          if (p === i) return null;
          const x1 = xOf(i);
          const x2 = xOf(p);
          const lift = Math.min(12 + Math.abs(i - p) * 6, 64);
          const cx = (x1 + x2) / 2;
          const stroke = compressedSet.has(i)
            ? PALETTE.lime
            : highlightSet.has(i)
              ? PALETTE.cyan
              : '#3a4170';
          const wide = compressedSet.has(i) || highlightSet.has(i);
          return (
            <motion.path
              key={`arc-${i}`}
              animate={{
                d: `M ${x1} ${Y - 5} Q ${cx} ${Y - lift} ${x2} ${Y - 5}`,
                stroke,
                strokeWidth: wide ? 1.3 : 0.6,
              }}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}

        {parent.map((p, i) => {
          const x = xOf(i);
          const isRoot = p === i;
          const color = colorOf(i);
          const lit =
            highlightSet.has(i) || (activePair?.includes(i) ?? false);
          return (
            <g key={`node-${i}`}>
              {isRoot && (
                <circle
                  cx={x}
                  cy={Y}
                  r={6.4}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.7}
                  strokeDasharray="1.4 1.1"
                />
              )}
              <motion.circle
                cx={x}
                cy={Y}
                r={4.6}
                animate={{
                  fill: color,
                  filter: `drop-shadow(0 0 ${lit ? 4.5 : 2}px ${color})`,
                }}
                stroke={PALETTE.void}
                strokeWidth={0.6}
              />
              <text
                x={x}
                y={Y + 1.4}
                textAnchor="middle"
                className="font-mono"
                style={{ fontSize: 3.6, fill: PALETTE.void, fontWeight: 700 }}
              >
                {i}
              </text>
              {isRoot && (
                <text
                  x={x}
                  y={Y - 8.2}
                  textAnchor="middle"
                  className="font-mono"
                  style={{ fontSize: 2.7, fill: PALETTE.haze, fontWeight: 700 }}
                >
                  rank {rank[i]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
