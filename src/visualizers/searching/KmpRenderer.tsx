import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { KmpState, KmpStatus } from './kmp';

const STEP = 28;

const STATUS_COLOR: Record<KmpStatus, string> = {
  compare: PALETTE.cyan,
  match: PALETTE.lime,
  mismatch: PALETTE.rose,
  shift: PALETTE.amber,
};

const Cell = ({
  char,
  color,
  faint,
}: {
  char: string;
  color: string | null;
  faint?: boolean;
}) => (
  <div
    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-semibold text-mist"
    style={{
      borderColor: color ?? 'rgba(255,255,255,0.08)',
      backgroundColor: color ? `${color}${faint ? '14' : '2e'}` : 'transparent',
    }}
  >
    {char}
  </div>
);

export const KmpRenderer = ({ frame }: RendererProps<KmpState>) => {
  const { text, pattern, lps, i, j, phase, status, matches } = frame.state;
  const m = pattern.length;
  const offset = phase === 'search' && i >= 0 && j >= 0 ? i - j : 0;
  const statusColor = STATUS_COLOR[status];

  const textColor = (k: number): string | null => {
    if (phase === 'build') return null;
    if (k === i) return statusColor;
    if (k >= offset && k < i) return PALETTE.lime;
    if (matches.some((start) => k >= start && k < start + m)) return PALETTE.lime;
    return null;
  };

  const patternColor = (p: number): string | null => {
    if (phase === 'build') {
      if (p === i) return statusColor;
      if (p === j) return PALETTE.cyan;
      return null;
    }
    if (p === j) return statusColor;
    if (p < j) return PALETTE.lime;
    return null;
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="w-full overflow-x-auto">
        <div className="mx-auto flex w-fit flex-col gap-2">
          <div className="flex gap-1" style={{ opacity: phase === 'build' ? 0.35 : 1 }}>
            {text.split('').map((ch, k) => (
              <Cell
                key={k}
                char={ch}
                color={textColor(k)}
                faint={textColor(k) === PALETTE.lime && k !== i && (k < offset || k >= i)}
              />
            ))}
          </div>

          <div className="flex gap-1" style={{ marginLeft: offset * STEP }}>
            {pattern.split('').map((ch, p) => (
              <Cell key={p} char={ch} color={patternColor(p)} />
            ))}
          </div>

          <div className="flex gap-1" style={{ marginLeft: offset * STEP }}>
            {pattern.split('').map((_, p) => (
              <div
                key={p}
                className="flex h-5 w-6 shrink-0 items-center justify-center rounded font-mono text-[10px]"
                style={{
                  color: phase === 'build' && p === i ? PALETTE.amber : PALETTE.haze,
                }}
              >
                {lps[p]}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs text-haze">
        {phase === 'build' ? 'LPS / failure function' : 'matches'}
        {phase !== 'build' &&
          (matches.length === 0 ? (
            <span className="text-haze/50">none yet</span>
          ) : (
            matches.map((start) => (
              <span
                key={start}
                className="rounded-md border border-lime/40 bg-lime/10 px-2 py-0.5 text-lime"
              >
                @{start}
              </span>
            ))
          ))}
      </div>
    </div>
  );
};
