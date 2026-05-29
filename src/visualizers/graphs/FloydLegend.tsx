import { PALETTE } from '@/themes/palette';

const ENTRIES = [
  { color: PALETTE.violet, label: 'Pivot row/col (via vertex k)' },
  { color: PALETTE.amber, label: 'i→k and k→j being summed' },
  { color: PALETTE.cyan, label: 'Cell under test (i, j)' },
  { color: PALETTE.lime, label: 'Just relaxed' },
];

export const FloydLegend = () => (
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
