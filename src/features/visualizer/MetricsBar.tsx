import { ArrowLeftRight, Eye, GitCompare } from 'lucide-react';
import type { MetricLabels } from '@/core/engine/types';
import type { TimelineMetrics } from '@/core/timeline/types';

interface MetricsBarProps {
  metrics: TimelineMetrics;
  labels?: MetricLabels;
}

const DEFAULT_LABELS: MetricLabels = {
  comparisons: 'Comparisons',
  swaps: 'Swaps',
  accesses: 'Accesses',
};

const META = [
  { key: 'comparisons', Icon: GitCompare, color: '#22d3ee' },
  { key: 'swaps', Icon: ArrowLeftRight, color: '#fb7185' },
  { key: 'accesses', Icon: Eye, color: '#a3e635' },
] as const;

export const MetricsBar = ({ metrics, labels }: MetricsBarProps) => {
  const resolved = labels ?? DEFAULT_LABELS;
  return (
  <div className="grid grid-cols-3 gap-3">
    {META.map(({ key, Icon, color }) => (
      <div
        key={key}
        className="glass flex flex-col gap-1 rounded-xl px-4 py-3"
      >
        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-haze">
          <Icon size={13} style={{ color }} />
          {resolved[key]}
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
};
