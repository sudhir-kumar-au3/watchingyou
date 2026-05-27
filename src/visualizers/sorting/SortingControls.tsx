import type { ControlsProps } from '@/core/engine/types';
import { DatasetControls } from '@/features/visualizer/DatasetControls';
import { makeScenario, randomArray, SCENARIOS } from './types';

const MIN_SIZE = 6;
const MAX_SIZE = 40;

export const SortingControls = ({
  input,
  onChange,
}: ControlsProps<number[]>) => (
  <div className="flex flex-col gap-4">
    <DatasetControls
      size={input.length}
      minSize={MIN_SIZE}
      maxSize={MAX_SIZE}
      onSizeChange={(next) => onChange(randomArray(next))}
      onShuffle={() => onChange(randomArray(input.length))}
      onCustom={(values) => onChange(values)}
    />
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-haze">
        Input scenario
      </span>
      <div className="flex flex-wrap gap-1.5">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() =>
              onChange(makeScenario(scenario.id, input.length || 18))
            }
            className="rounded-lg glass px-3 py-1.5 text-xs text-haze transition hover:border-cyan/50 hover:text-cyan active:scale-95"
          >
            {scenario.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);
