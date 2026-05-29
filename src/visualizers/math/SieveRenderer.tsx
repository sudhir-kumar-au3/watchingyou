import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { SieveState } from './sieve';

const COLUMNS = 10;

export const SieveRenderer = ({ frame }: RendererProps<SieveState>) => {
  const { n, status, current, marking } = frame.state;
  const numbers = Array.from({ length: n - 1 }, (_, i) => i + 2);

  const cellColor = (value: number): { bg: string; text: string } => {
    if (value === current) return { bg: PALETTE.cyan, text: PALETTE.void };
    if (value === marking) return { bg: PALETTE.amber, text: PALETTE.void };
    if (status[value] === 1) return { bg: `${PALETTE.lime}26`, text: PALETTE.lime };
    if (status[value] === 2) return { bg: 'transparent', text: '#3a4170' };
    return { bg: 'rgba(255,255,255,0.05)', text: '#c7cdf0' };
  };

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`,
          width: 'min(100%, 420px)',
        }}
      >
        {numbers.map((value) => {
          const { bg, text } = cellColor(value);
          const composite = status[value] === 2;
          return (
            <div
              key={value}
              className="flex aspect-square items-center justify-center rounded-md border font-mono text-xs font-semibold transition-colors duration-150"
              style={{
                backgroundColor: bg,
                borderColor: 'rgba(255,255,255,0.05)',
                color: text,
                textDecoration: composite ? 'line-through' : 'none',
              }}
            >
              {value}
            </div>
          );
        })}
      </div>
    </div>
  );
};
