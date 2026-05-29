import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { HuffmanState, HuffNodeView } from './huffman';

export const HuffmanRenderer = ({ frame }: RendererProps<HuffmanState>) => {
  const { nodes, edges, merging, codes } = frame.state;
  const pos = new Map<string, HuffNodeView>(nodes.map((n) => [n.id, n]));
  const mergeSet = new Set(merging);
  const codeOf = new Map(codes.map((c) => [c.char, c.code]));

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative min-h-0 flex-1">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          {edges.map((edge) => {
            const a = pos.get(edge.parent);
            const b = pos.get(edge.child);
            if (!a || !b) return null;
            return (
              <g key={`${edge.parent}-${edge.child}`}>
                <motion.line
                  animate={{ x1: a.x, y1: a.y, x2: b.x, y2: b.y }}
                  stroke="#2a3160"
                  strokeWidth={0.6}
                />
                <text
                  x={(a.x + b.x) / 2 - 1}
                  y={(a.y + b.y) / 2}
                  style={{ fontSize: 2.6, fill: PALETTE.haze, fontWeight: 700 }}
                >
                  {edge.bit}
                </text>
              </g>
            );
          })}
          {nodes.map((node) => {
            const merging2 = mergeSet.has(node.id);
            const fill = merging2 ? PALETTE.amber : node.isLeaf ? PALETTE.cyan : PALETTE.idle;
            const code = node.isLeaf ? codeOf.get(node.label) : undefined;
            return (
              <g key={node.id}>
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ cx: node.x, cy: node.y, scale: 1, fill, filter: `drop-shadow(0 0 ${merging2 ? 4 : 2}px ${fill})` }}
                  r={node.isLeaf ? 4.4 : 3.6}
                  stroke={PALETTE.void}
                  strokeWidth={0.5}
                />
                <text
                  x={node.x}
                  y={node.y + 1.2}
                  textAnchor="middle"
                  className="font-mono"
                  style={{ fontSize: 3, fill: PALETTE.void, fontWeight: 700 }}
                >
                  {node.isLeaf ? node.label : node.freq}
                </text>
                {node.isLeaf && (
                  <text
                    x={node.x}
                    y={node.y + 7}
                    textAnchor="middle"
                    className="font-mono"
                    style={{ fontSize: 2.6, fill: PALETTE.haze }}
                  >
                    {code ? code : node.freq}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {codes.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pt-1 font-mono text-[11px] text-haze">
          {codes.map((c) => (
            <span key={c.char}>
              <span className="text-cyan">{c.char}</span>
              <span className="text-haze/60">=</span>
              <span className="text-lime">{c.code}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
