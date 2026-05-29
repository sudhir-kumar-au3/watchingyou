import { PALETTE } from '@/themes/palette';

const ENTRIES = [
  { color: PALETTE.cyan, label: 'Trying / placed queen' },
  { color: PALETTE.rose, label: 'Attacked — rejected' },
  { color: PALETTE.lime, label: 'Final solution' },
];

export const NQueensLegend = () => (
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
