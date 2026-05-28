import { PALETTE } from '@/themes/palette';

const ENTRIES = [
  { color: PALETTE.cyan, label: 'Sifting node' },
  { color: PALETTE.amber, label: 'Comparing children' },
  { color: PALETTE.rose, label: 'Swapped' },
  { color: PALETTE.lime, label: 'Sorted (locked at tail)' },
  { color: PALETTE.idle, label: 'In heap' },
];

export const HeapLegend = () => (
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
