import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { TreeNode, TreeState } from './types';

const nodeColor = (state: TreeState, id: string): string => {
  if (state.rotating.includes(id)) return PALETTE.violet;
  if (state.active === id) return PALETTE.cyan;
  if (state.comparing === id) return PALETTE.amber;
  if (state.visited.includes(id)) return PALETTE.lime;
  return PALETTE.idle;
};

export const TreeRenderer = ({ frame }: RendererProps<TreeState>) => {
  const state = frame.state;
  const positions = new Map<string, TreeNode>(
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
                strokeWidth: highlight ? 1.2 : 0.7,
              }}
              strokeLinecap="round"
            />
          );
        })}

        {state.nodes.map((node) => {
          const color = nodeColor(state, node.id);
          return (
            <motion.g
              key={node.id}
              animate={{ x: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <motion.circle
                animate={{
                  cx: node.x,
                  cy: node.y,
                  fill: color,
                  filter: `drop-shadow(0 0 ${color === PALETTE.idle ? 0 : 3}px ${color})`,
                }}
                r={5}
                stroke={PALETTE.void}
                strokeWidth={0.6}
              />
              <motion.text
                animate={{ x: node.x, y: node.y + 1.6 }}
                textAnchor="middle"
                className="font-mono"
                style={{ fontSize: 3.4, fill: PALETTE.void, fontWeight: 700 }}
              >
                {node.value}
              </motion.text>
              {node.badge !== undefined && (
                <motion.text
                  animate={{ x: node.x + 5.4, y: node.y - 4 }}
                  textAnchor="middle"
                  className="font-mono"
                  style={{ fontSize: 2.8, fill: PALETTE.haze, fontWeight: 700 }}
                >
                  {node.badge}
                </motion.text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
};
