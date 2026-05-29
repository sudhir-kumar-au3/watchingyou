import { Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { randomActivities, type Activity } from './activitySelection';

export const ActivityControls = ({ input, onChange }: ControlsProps<Activity[]>) => (
  <div className="flex flex-col gap-4">
    <span className="font-mono text-xs text-haze">
      {input.length} activities · pick the most that fit
    </span>
    <button
      type="button"
      onClick={() => onChange(randomActivities(input.length))}
      className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-lime/50 hover:text-lime active:scale-95"
    >
      <Shuffle size={15} />
      Random activities
    </button>
  </div>
);
