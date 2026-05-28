import { PALETTE } from '@/themes/palette';

const ENTRIES = [
  { color: PALETTE.cyan, label: 'Edge under consideration' },
  { color: PALETTE.lime, label: 'In the spanning tree' },
  { color: PALETTE.idle, label: 'Not yet connected' },
];

export const MstLegend = () => (
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
