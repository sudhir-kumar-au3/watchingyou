import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { GraphNode, GraphState } from './types';

const nodeColor = (state: GraphState, id: string): string => {
  if (state.current === id) return PALETTE.cyan;
  if (state.frontier.includes(id)) return PALETTE.amber;
  if (state.visited.includes(id)) return PALETTE.lime;
  return PALETTE.idle;
};

const edgeKey = (a: string, b: string): string => [a, b].sort().join('~');

const edgeActive = (state: GraphState, a: string, b: string): boolean => {
  const edge = state.activeEdge;
  if (!edge) return false;
  return (edge[0] === a && edge[1] === b) || (edge[0] === b && edge[1] === a);
};

export const GraphRenderer = ({ frame }: RendererProps<GraphState>) => {
  const state = frame.state;
  const positions = new Map<string, GraphNode>(
    state.nodes.map((node) => [node.id, node])
  );

  const pathEdges = new Set<string>();
  for (let i = 0; i < state.path.length - 1; i += 1) {
    pathEdges.add(edgeKey(state.path[i], state.path[i + 1]));
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="h-full max-h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {state.edges.map(({ source, target, weight }) => {
          const a = positions.get(source);
          const b = positions.get(target);
          if (!a || !b) return null;
          const active = edgeActive(state, source, target);
          const onPath = pathEdges.has(edgeKey(source, target));
          const stroke = active
            ? PALETTE.cyan
            : onPath
              ? PALETTE.lime
              : '#232a52';
          return (
            <g key={`${source}-${target}`}>
              <motion.line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                animate={{
                  stroke,
                  strokeWidth: active || onPath ? 1.4 : 0.7,
                }}
                strokeLinecap="round"
              />
              {weight !== undefined && (
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 0.6}
                  textAnchor="middle"
                  style={{ fontSize: 2.8, fill: PALETTE.haze, fontWeight: 600 }}
                >
                  {weight}
                </text>
              )}
            </g>
          );
        })}

        {state.nodes.map((node) => {
          const color = nodeColor(state, node.id);
          const orderIndex = state.order.indexOf(node.id);
          const dist = state.distances[node.id];
          const hasDist = dist !== undefined && Number.isFinite(dist);
          const isGoal = state.goal === node.id;
          return (
            <g key={node.id}>
              {isGoal && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={6.4}
                  fill="none"
                  stroke={PALETTE.rose}
                  strokeWidth={0.7}
                  strokeDasharray="1.5 1.2"
                />
              )}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={4.6}
                animate={{
                  fill: color,
                  filter: `drop-shadow(0 0 ${color === PALETTE.idle ? 0 : 3}px ${color})`,
                }}
                stroke={PALETTE.void}
                strokeWidth={0.6}
              />
              <text
                x={node.x}
                y={node.y + 1.4}
                textAnchor="middle"
                className="font-mono"
                style={{ fontSize: 3.6, fill: PALETTE.void, fontWeight: 700 }}
              >
                {node.id}
              </text>
              {hasDist && (
                <text
                  x={node.x + 5.8}
                  y={node.y - 3.6}
                  textAnchor="middle"
                  style={{ fontSize: 3, fill: PALETTE.cyan, fontWeight: 700 }}
                >
                  {dist}
                </text>
              )}
              {!hasDist && orderIndex >= 0 && (
                <text
                  x={node.x + 5.5}
                  y={node.y - 4}
                  textAnchor="middle"
                  style={{ fontSize: 2.8, fill: PALETTE.lime }}
                >
                  {orderIndex + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
