import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import type { Frame } from '@/core/timeline/types';
import type { SortVisualModule } from '@/visualizers/registry';
import type { SortState } from '@/visualizers/sorting/types';

interface CompareLaneProps {
  visual: SortVisualModule;
  frame: Frame<SortState> | null;
  finished: boolean;
}

const Stat = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase tracking-wide text-haze">{label}</span>
    <span className="font-mono text-lg font-semibold tabular-nums" style={{ color }}>
      {value}
    </span>
  </div>
);

export const CompareLane = ({ visual, frame, finished }: CompareLaneProps) => {
  const { algorithm, Renderer } = visual;
  const metrics = frame?.metrics;

  return (
    <Panel strong className="flex min-w-0 flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: algorithm.accent, boxShadow: `0 0 10px ${algorithm.accent}` }}
          />
          <h3 className="font-display text-base font-semibold text-mist">
            {algorithm.name}
          </h3>
        </div>
        {finished && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1 rounded-full bg-lime/15 px-2.5 py-1 text-[11px] text-lime"
          >
            <CheckCircle2 size={12} />
            Sorted
          </motion.span>
        )}
      </div>

      <div className="h-[280px] rounded-xl bg-black/20 p-2">
        {frame && <Renderer frame={frame} previous={null} />}
      </div>

      <div className="flex items-center justify-between gap-4 px-1">
        <Stat label="Comparisons" value={metrics?.comparisons ?? 0} color="#22d3ee" />
        <Stat label="Swaps" value={metrics?.swaps ?? 0} color="#fb7185" />
        <Stat label="Accesses" value={metrics?.accesses ?? 0} color="#a3e635" />
      </div>
    </Panel>
  );
};
