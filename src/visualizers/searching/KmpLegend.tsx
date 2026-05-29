import { PALETTE } from '@/themes/palette';

const ENTRIES = [
  { color: PALETTE.lime, label: 'Matched characters' },
  { color: PALETTE.rose, label: 'Mismatch' },
  { color: PALETTE.amber, label: 'LPS shift (reuse)' },
  { color: PALETTE.cyan, label: 'Prefix pointer (LPS build)' },
];

export const KmpLegend = () => (
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
