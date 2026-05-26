import type { ControlsProps } from '@/core/engine/types';
import { DatasetControls } from '@/features/visualizer/DatasetControls';
import { randomArray } from './types';

const MIN_SIZE = 6;
const MAX_SIZE = 40;

export const SortingControls = ({
  input,
  onChange,
}: ControlsProps<number[]>) => (
  <DatasetControls
    size={input.length}
    minSize={MIN_SIZE}
    maxSize={MAX_SIZE}
    onSizeChange={(next) => onChange(randomArray(next))}
    onShuffle={() => onChange(randomArray(input.length))}
    onCustom={(values) => onChange(values)}
  />
);
