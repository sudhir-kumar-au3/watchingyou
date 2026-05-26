import { ArrowLeftRight, Eye, GitCompare } from 'lucide-react';
import type { TimelineMetrics } from '@/core/timeline/types';

interface MetricsBarProps {
  metrics: TimelineMetrics;
}

const ITEMS = [
  { key: 'comparisons', label: 'Comparisons', Icon: GitCompare, color: '#22d3ee' },
  { key: 'swaps', label: 'Swaps', Icon: ArrowLeftRight, color: '#fb7185' },
  { key: 'accesses', label: 'Accesses', Icon: Eye, color: '#a3e635' },
] as const;

export const MetricsBar = ({ metrics }: MetricsBarProps) => (
  <div className="grid grid-cols-3 gap-3">
    {ITEMS.map(({ key, label, Icon, color }) => (
      <div
        key={key}
        className="glass flex flex-col gap-1 rounded-xl px-4 py-3"
      >
        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-haze">
          <Icon size={13} style={{ color }} />
          {label}
        </span>
        <span
          className="font-mono text-2xl font-semibold tabular-nums"
          style={{ color }}
        >
          {metrics[key]}
        </span>
      </div>
    ))}
  </div>
);
