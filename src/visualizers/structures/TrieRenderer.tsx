import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { TrieNodeView, TrieState } from './trie';

export const TrieRenderer = ({ frame }: RendererProps<TrieState>) => {
  const state = frame.state;
  const positions = new Map<string, TrieNodeView>(
    state.nodes.map((node) => [node.id, node])
  );
  const onPath = new Set(state.path);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="h-full max-h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {state.edges.map(({ parent, child }) => {
          const a = positions.get(parent);
          const b = positions.get(child);
          if (!a || !b) return null;
          const highlight = onPath.has(parent) && onPath.has(child);
          return (
            <motion.line
              key={`${parent}-${child}`}
              animate={{
                x1: a.x,
                y1: a.y,
                x2: b.x,
                y2: b.y,
                stroke: highlight ? PALETTE.cyan : '#232a52',
                strokeWidth: highlight ? 1.1 : 0.6,
              }}
              strokeLinecap="round"
            />
          );
        })}

        {state.nodes.map((node) => {
          const isActive = state.active === node.id;
          const fill = isActive
            ? PALETTE.cyan
            : node.isEnd
              ? PALETTE.lime
              : PALETTE.idle;
          return (
            <g key={node.id}>
              {node.isEnd && (
                <motion.circle
                  animate={{ cx: node.x, cy: node.y }}
                  r={5.4}
                  fill="none"
                  stroke={PALETTE.lime}
                  strokeWidth={0.5}
                  strokeDasharray="1.2 1"
                />
              )}
              <motion.circle
                animate={{
                  cx: node.x,
                  cy: node.y,
                  fill,
                  filter: `drop-shadow(0 0 ${fill === PALETTE.idle ? 0 : 3}px ${fill})`,
                }}
                r={4}
                stroke={PALETTE.void}
                strokeWidth={0.5}
              />
              <motion.text
                animate={{ x: node.x, y: node.y + 1.3 }}
                textAnchor="middle"
                className="font-mono"
                style={{ fontSize: 3.2, fill: PALETTE.void, fontWeight: 700 }}
              >
                {node.char}
              </motion.text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
