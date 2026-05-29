import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { MazeState } from './maze';

export const MazeRenderer = ({ frame }: RendererProps<MazeState>) => {
  const { cols, grid, start, goal, visited, deadEnds, path, current, solved } =
    frame.state;
  const visitedSet = new Set(visited);
  const deadEndSet = new Set(deadEnds);
  const pathSet = new Set(path.map(([r, c]) => `${r},${c}`));

  const cellBg = (r: number, c: number): string => {
    if (grid[r][c] === 1) return '#0b0e22';
    const k = `${r},${c}`;
    if (current && current[0] === r && current[1] === c) return PALETTE.cyan;
    if (pathSet.has(k)) return solved ? PALETTE.lime : 'rgba(34, 211, 238, 0.4)';
    if (deadEndSet.has(k)) return 'rgba(251, 113, 133, 0.18)';
    if (visitedSet.has(k)) return 'rgba(34, 211, 238, 0.12)';
    return 'rgba(255, 255, 255, 0.05)';
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="grid aspect-square w-full max-w-[min(100%,440px)] gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {grid.flatMap((row, r) =>
          row.map((_, c) => {
            const isStart = r === start[0] && c === start[1];
            const isGoal = r === goal[0] && c === goal[1];
            const ring = isStart
              ? PALETTE.violet
              : isGoal
                ? PALETTE.amber
                : null;
            return (
              <div
                key={`${r},${c}`}
                className="rounded-[3px] transition-colors duration-200"
                style={{
                  backgroundColor: cellBg(r, c),
                  boxShadow: ring ? `inset 0 0 0 2px ${ring}` : undefined,
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
