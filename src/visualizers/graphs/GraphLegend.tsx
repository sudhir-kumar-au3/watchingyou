import { PALETTE } from '@/themes/palette';

const ENTRIES = [
  { color: PALETTE.cyan, label: 'Current' },
  { color: PALETTE.amber, label: 'In frontier' },
  { color: PALETTE.lime, label: 'Visited' },
  { color: PALETTE.idle, label: 'Unseen' },
];

export const GraphLegend = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
    {ENTRIES.map(({ color, label }) => (
      <span key={label} className="flex items-center gap-1.5 text-xs text-haze">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
        {label}
      </span>
    ))}
  </div>
);
