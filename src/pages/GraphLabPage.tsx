import { useMemo, useRef, useState } from 'react';
import { Eraser, Play, Pencil } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Select } from '@/components/ui/Select';
import { GraphRenderer } from '@/visualizers/graphs/GraphRenderer';
import { PlaybackControls } from '@/features/visualizer/PlaybackControls';
import { TimelineScrubber } from '@/features/visualizer/TimelineScrubber';
import { usePlaybackEngine } from '@/hooks/usePlaybackEngine';
import { usePlaybackStore } from '@/store/playbackStore';
import type { Timeline } from '@/core/timeline/types';
import type { AlgorithmModule } from '@/core/engine/types';
import type { GraphInput, GraphNode, GraphState } from '@/visualizers/graphs/types';
import { bfsModule } from '@/visualizers/graphs/bfs';
import { dfsModule } from '@/visualizers/graphs/dfs';
import { dijkstraModule } from '@/visualizers/graphs/dijkstra';
import { astarModule } from '@/visualizers/graphs/astar';
import { bellmanFordModule } from '@/visualizers/graphs/bellmanFord';
import { primModule } from '@/visualizers/graphs/prim';
import { kruskalModule } from '@/visualizers/graphs/kruskal';
import { bipartiteModule } from '@/visualizers/graphs/bipartite';
import { sccModule } from '@/visualizers/graphs/scc';
import { articulationModule } from '@/visualizers/graphs/articulation';
import { topologicalModule } from '@/visualizers/graphs/topological';
import { cn } from '@/utils/cn';

interface Runnable {
  module: AlgorithmModule<GraphState, GraphInput>;
  weighted: boolean;
  goal: boolean;
  directed: boolean;
}

const RUNNABLE: Runnable[] = [
  { module: bfsModule, weighted: false, goal: false, directed: false },
  { module: dfsModule, weighted: false, goal: false, directed: false },
  { module: dijkstraModule, weighted: true, goal: true, directed: false },
  { module: astarModule, weighted: true, goal: true, directed: false },
  { module: bellmanFordModule, weighted: true, goal: true, directed: false },
  { module: primModule, weighted: true, goal: false, directed: false },
  { module: kruskalModule, weighted: true, goal: false, directed: false },
  { module: bipartiteModule, weighted: false, goal: false, directed: false },
  { module: sccModule, weighted: false, goal: false, directed: true },
  { module: articulationModule, weighted: false, goal: false, directed: false },
  { module: topologicalModule, weighted: false, goal: false, directed: true },
];

interface EditEdge {
  source: string;
  target: string;
  weight: number;
}

const clamp = (value: number): number => Math.max(5, Math.min(95, value));

const SAMPLE_NODES: GraphNode[] = [
  { id: 'A', x: 26, y: 24 },
  { id: 'B', x: 64, y: 22 },
  { id: 'C', x: 18, y: 60 },
  { id: 'D', x: 50, y: 56 },
  { id: 'E', x: 82, y: 58 },
];
const SAMPLE_EDGES: EditEdge[] = [
  { source: 'A', target: 'B', weight: 4 },
  { source: 'A', target: 'C', weight: 2 },
  { source: 'B', target: 'D', weight: 5 },
  { source: 'C', target: 'D', weight: 1 },
  { source: 'D', target: 'E', weight: 3 },
];

export const GraphLabPage = () => {
  const [nodes, setNodes] = useState<GraphNode[]>(SAMPLE_NODES);
  const [edges, setEdges] = useState<EditEdge[]>(SAMPLE_EDGES);
  const [pending, setPending] = useState<string | null>(null);
  const [algoIndex, setAlgoIndex] = useState(2);
  const [start, setStart] = useState('A');
  const [goal, setGoal] = useState('E');
  const [mode, setMode] = useState<'edit' | 'run'>('edit');
  const [error, setError] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragId = useRef<string | null>(null);
  const moved = useRef(false);
  const counter = useRef(SAMPLE_NODES.length);

  const index = usePlaybackStore((s) => s.index);
  const loadTimeline = usePlaybackStore((s) => s.loadTimeline);
  const play = usePlaybackStore((s) => s.play);
  usePlaybackEngine();

  const [timeline, setTimeline] = useState<Timeline<GraphState> | null>(null);

  const algo = RUNNABLE[algoIndex];

  const toCoords = (event: React.PointerEvent | React.MouseEvent): { x: number; y: number } => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return {
      x: Math.round(((event.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((event.clientY - rect.top) / rect.height) * 100),
    };
  };

  const addNode = (event: React.MouseEvent): void => {
    if (mode !== 'edit') return;
    if (event.target !== event.currentTarget) return;
    if (nodes.length >= 12) return;
    const { x, y } = toCoords(event);
    const id = String.fromCharCode(65 + counter.current);
    counter.current += 1;
    setNodes((prev) => [...prev, { id, x: clamp(x), y: clamp(y) }]);
  };

  const onNodeUp = (id: string): void => {
    if (moved.current) return;
    if (pending === null) {
      setPending(id);
    } else if (pending === id) {
      setPending(null);
    } else {
      const exists = edges.some(
        (e) =>
          (e.source === pending && e.target === id) ||
          (e.source === id && e.target === pending)
      );
      if (!exists) {
        setEdges((prev) => [
          ...prev,
          { source: pending, target: id, weight: Math.floor(Math.random() * 8) + 1 },
        ]);
      }
      setPending(null);
    }
  };

  const removeNode = (id: string): void => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    if (start === id) setStart(nodes.find((n) => n.id !== id)?.id ?? '');
    if (goal === id) setGoal(nodes.find((n) => n.id !== id)?.id ?? '');
  };

  const onPointerMove = (event: React.PointerEvent): void => {
    if (!dragId.current) return;
    moved.current = true;
    const { x, y } = toCoords(event);
    setNodes((prev) =>
      prev.map((n) => (n.id === dragId.current ? { ...n, x: clamp(x), y: clamp(y) } : n))
    );
  };

  const clearAll = (): void => {
    setNodes([]);
    setEdges([]);
    setPending(null);
    counter.current = 0;
    setStart('');
    setGoal('');
  };

  const run = (): void => {
    setError(null);
    if (nodes.length === 0) {
      setError('Add at least one node first.');
      return;
    }
    const input: GraphInput = {
      nodes: nodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
        ...(algo.weighted ? { weight: e.weight } : {}),
      })),
      start: nodes.some((n) => n.id === start) ? start : nodes[0].id,
      goal: algo.goal ? goal : undefined,
      directed: algo.directed,
    };
    try {
      const result = algo.module.generate(input);
      setTimeline(result);
      loadTimeline(result.frames.length);
      setMode('run');
      play();
    } catch {
      setError('That algorithm could not run on this graph.');
    }
  };

  const frames = timeline?.frames ?? [];
  const safeIndex = Math.min(index, Math.max(frames.length - 1, 0));
  const frame = frames[safeIndex] ?? null;
  const nodeOptions = useMemo(
    () => nodes.map((n) => ({ value: n.id, label: n.id })),
    [nodes]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-cyan">Graph lab</span>
        <h1 className="font-display text-3xl font-bold text-mist">
          Build a graph, run any algorithm on it
        </h1>
        <p className="max-w-2xl text-sm text-haze">
          Click empty space to drop a node, click two nodes to connect them, drag
          to rearrange, double-click to remove. Then pick an algorithm and watch
          it run on <em>your</em> graph.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel strong className="relative aspect-square w-full overflow-hidden p-0">
          {mode === 'edit' ? (
            <svg
              ref={svgRef}
              viewBox="0 0 100 100"
              className="h-full w-full cursor-crosshair touch-none"
              onClick={addNode}
              onPointerMove={onPointerMove}
              onPointerUp={() => {
                dragId.current = null;
              }}
            >
              {edges.map((edge, i) => {
                const a = nodes.find((n) => n.id === edge.source);
                const b = nodes.find((n) => n.id === edge.target);
                if (!a || !b) return null;
                return (
                  <g key={i}>
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke="#3a4170"
                      strokeWidth={0.8}
                      strokeLinecap="round"
                      className="cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEdges((prev) => prev.filter((_, idx) => idx !== i));
                      }}
                    />
                    {algo.weighted && (
                      <text
                        x={(a.x + b.x) / 2}
                        y={(a.y + b.y) / 2 - 0.8}
                        textAnchor="middle"
                        style={{ fontSize: 3, fill: '#8b93c7', fontWeight: 600 }}
                      >
                        {edge.weight}
                      </text>
                    )}
                  </g>
                );
              })}
              {nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={5}
                    fill={pending === node.id ? '#22d3ee' : '#2c356b'}
                    stroke={node.id === start ? '#a3e635' : '#05060f'}
                    strokeWidth={node.id === start ? 1.2 : 0.6}
                    className="cursor-pointer"
                    style={{ touchAction: 'none' }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      dragId.current = node.id;
                      moved.current = false;
                      (event.target as Element).setPointerCapture(event.pointerId);
                    }}
                    onPointerUp={(event) => {
                      event.stopPropagation();
                      dragId.current = null;
                      onNodeUp(node.id);
                    }}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      removeNode(node.id);
                    }}
                  />
                  <text
                    x={node.x}
                    y={node.y + 1.4}
                    textAnchor="middle"
                    className="pointer-events-none font-mono"
                    style={{ fontSize: 3.6, fill: '#05060f', fontWeight: 700 }}
                  >
                    {node.id}
                  </text>
                </g>
              ))}
            </svg>
          ) : (
            frame && <GraphRenderer frame={frame} previous={null} />
          )}
          {mode === 'edit' && nodes.length === 0 && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-haze/60">
              click anywhere to add your first node
            </span>
          )}
        </Panel>

        <div className="flex min-w-0 flex-col gap-4">
          <Panel className="flex flex-col gap-4 p-5">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wide text-haze">
                Algorithm
              </span>
              <Select
                label="Algorithm"
                value={String(algoIndex)}
                options={RUNNABLE.map((r, i) => ({
                  value: String(i),
                  label: r.module.name,
                }))}
                onChange={(value) => {
                  setAlgoIndex(Number(value));
                  setMode('edit');
                }}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wide text-haze">
                  Start
                </span>
                <Select label="Start node" value={start} options={nodeOptions} onChange={setStart} />
              </label>
              {algo.goal && (
                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wide text-haze">
                    Goal
                  </span>
                  <Select label="Goal node" value={goal} options={nodeOptions} onChange={setGoal} />
                </label>
              )}
            </div>
            <p className="font-mono text-[11px] text-haze">
              {nodes.length} nodes · {edges.length} edges
              {algo.weighted ? ' · weighted' : ''}
              {algo.directed ? ' · directed' : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={run}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan px-4 py-2.5 font-medium text-void shadow-glow transition hover:brightness-110 active:scale-95"
              >
                <Play size={16} />
                Run
              </button>
              {mode === 'run' && (
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
                >
                  <Pencil size={15} />
                  Edit
                </button>
              )}
              <button
                type="button"
                onClick={clearAll}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-rose/50 hover:text-rose active:scale-95',
                  mode === 'run' && 'hidden'
                )}
              >
                <Eraser size={15} />
                Clear
              </button>
            </div>
            {error && <p className="text-xs text-rose">{error}</p>}
          </Panel>

          {mode === 'run' && (
            <Panel className="flex flex-col gap-4 p-5">
              <TimelineScrubber />
              <PlaybackControls />
              <p className="font-mono text-xs text-haze">
                {frame?.description ?? ''}
              </p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};
