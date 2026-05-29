import { Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { Select } from '@/components/ui/Select';
import { generateMaze, type MazeInput } from './maze';

const SIZES = ['4', '5', '6', '7', '8'];

export const MazeControls = ({ input, onChange }: ControlsProps<MazeInput>) => {
  const cells = (input.rows - 1) / 2;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-haze">
          Maze size
        </span>
        <Select
          label="Maze size"
          value={String(cells)}
          options={SIZES.map((size) => ({
            value: size,
            label: `${Number(size) * 2 + 1} × ${Number(size) * 2 + 1}`,
          }))}
          onChange={(value) => onChange(generateMaze(Number(value)))}
        />
      </label>
      <button
        type="button"
        onClick={() => onChange(generateMaze(cells))}
        className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
      >
        <Shuffle size={15} />
        New maze
      </button>
    </div>
  );
};
