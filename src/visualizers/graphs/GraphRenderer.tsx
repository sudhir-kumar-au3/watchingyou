import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { GraphNode, GraphState } from './types';

const COMPONENT_CYCLE = [
  PALETTE.violet,
  PALETTE.amber,
  PALETTE.rose,
  '#34d399',
  '#38bdf8',
  '#f472b6',
  '#c084fc',
  '#facc15',
];

const nodeColor = (state: GraphState, id: string): string => {
  if (state.components) {
    const component = state.components[id];
    if (component === undefined || component < 0) return PALETTE.idle;
    return COMPONENT_CYCLE[component % COMPONENT_CYCLE.length];
  }
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

  const highlightEdges = new Set<string>();
  for (let i = 0; i < state.path.length - 1; i += 1) {
    highlightEdges.add(edgeKey(state.path[i], state.path[i + 1]));
  }
  state.treeEdges.forEach(([u, v]) => highlightEdges.add(edgeKey(u, v)));

  const NODE_R = 4.6;

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
          const highlighted = highlightEdges.has(edgeKey(source, target));
          const stroke = active
            ? PALETTE.cyan
            : highlighted
              ? PALETTE.lime
              : '#232a52';
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const ex = b.x - ux * NODE_R;
          const ey = b.y - uy * NODE_R;
          const arrow = state.directed
            ? `${ex},${ey} ${ex - ux * 3 - uy * 1.7},${ey - uy * 3 + ux * 1.7} ${ex - ux * 3 + uy * 1.7},${ey - uy * 3 - ux * 1.7}`
            : null;
          return (
            <g key={`${source}-${target}`}>
              <motion.line
                x1={a.x}
                y1={a.y}
                x2={state.directed ? ex : b.x}
                y2={state.directed ? ey : b.y}
                animate={{
                  stroke,
                  strokeWidth: active || highlighted ? 1.4 : 0.7,
                }}
                strokeLinecap="round"
              />
              {arrow && <polygon points={arrow} fill={stroke} />}
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
          const isMarked = state.marked?.includes(node.id) ?? false;
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
              {isMarked && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={6.6}
                  fill="none"
                  stroke={PALETTE.rose}
                  strokeWidth={1}
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
