import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import { PALETTE } from '@/themes/palette';
import type { ActivityState } from './activitySelection';

export const ActivityRenderer = ({ frame }: RendererProps<ActivityState>) => {
  const { activities, selected, rejected, current, maxTime } = frame.state;
  const selectedSet = new Set(selected);
  const rejectedSet = new Set(rejected);

  return (
    <div className="flex h-full w-full flex-col justify-center gap-1.5 px-2">
      {activities.map((activity, i) => {
        const isSelected = selectedSet.has(i);
        const isRejected = rejectedSet.has(i);
        const isCurrent = current === i;
        const color = isSelected
          ? PALETTE.lime
          : isCurrent
            ? PALETTE.cyan
            : isRejected
              ? PALETTE.rose
              : PALETTE.idle;
        const left = (activity.start / maxTime) * 100;
        const width = ((activity.end - activity.start) / maxTime) * 100;
        return (
          <div key={i} className="relative h-6 w-full">
            <motion.div
              animate={{
                backgroundColor: `${color}${isSelected || isCurrent ? '2e' : '14'}`,
                borderColor: color,
                opacity: isRejected ? 0.45 : 1,
              }}
              className="absolute flex h-full items-center justify-center rounded-md border font-mono text-[10px] text-mist"
              style={{ left: `${left}%`, width: `${width}%` }}
            >
              {activity.start}–{activity.end}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};
