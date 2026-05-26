import { TONE_COLOR, type BarTone } from '@/themes/palette';

const ENTRIES: { tone: BarTone; label: string }[] = [
  { tone: 'compare', label: 'Comparing' },
  { tone: 'swap', label: 'Swapping' },
  { tone: 'write', label: 'Writing' },
  { tone: 'pivot', label: 'Pivot' },
  { tone: 'sorted', label: 'Sorted' },
];

export const Legend = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
    {ENTRIES.map(({ tone, label }) => (
      <span key={tone} className="flex items-center gap-1.5 text-xs text-haze">
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{
            backgroundColor: TONE_COLOR[tone],
            boxShadow: `0 0 8px ${TONE_COLOR[tone]}`,
          }}
        />
        {label}
      </span>
    ))}
  </div>
);
