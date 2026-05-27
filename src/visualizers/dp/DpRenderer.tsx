import { Fragment } from 'react';
import { motion } from 'framer-motion';
import type { RendererProps } from '@/core/engine/types';
import type { DpState } from './types';
import { cn } from '@/utils/cn';

const keyOf = (i: number, j: number): string => `${i}:${j}`;

export const DpRenderer = ({ frame }: RendererProps<DpState>) => {
  const { grid, rowHeader, colHeader, current, dependencies, path } =
    frame.state;
  const cols = colHeader.length;

  const deps = new Set(dependencies.map(([i, j]) => keyOf(i, j)));
  const onPath = new Set(path.map(([i, j]) => keyOf(i, j)));

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto">
      <div
        className="grid gap-1 text-center"
        style={{
          gridTemplateColumns: `auto repeat(${cols}, minmax(20px, 38px))`,
        }}
      >
        <div />
        {colHeader.map((header, j) => (
          <div
            key={`col-${j}`}
            className="flex items-center justify-center pb-1 font-mono text-[11px] font-semibold text-cyan"
          >
            {header}
          </div>
        ))}

        {grid.map((row, i) => (
          <Fragment key={`row-${i}`}>
            <div className="flex items-center justify-end pr-1.5 font-mono text-[11px] font-semibold text-violet">
              {rowHeader[i]}
            </div>
            {row.map((cell, j) => {
              const isCurrent = current?.[0] === i && current?.[1] === j;
              const isDep = deps.has(keyOf(i, j));
              const isPath = onPath.has(keyOf(i, j));
              const filled = cell !== null;
              return (
                <motion.div
                  key={`cell-${i}-${j}`}
                  animate={{
                    scale: isCurrent ? 1.08 : 1,
                    backgroundColor: isCurrent
                      ? 'rgb(34 211 238 / 0.28)'
                      : isPath
                        ? 'rgb(163 230 53 / 0.2)'
                        : isDep
                          ? 'rgb(251 191 36 / 0.18)'
                          : filled
                            ? 'rgb(255 255 255 / 0.05)'
                            : 'rgb(255 255 255 / 0.01)',
                  }}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-md border font-mono text-xs',
                    isCurrent
                      ? 'border-cyan/60 text-cyan'
                      : isPath
                        ? 'border-lime/40 text-lime'
                        : isDep
                          ? 'border-amber/40 text-amber'
                          : 'border-white/5 text-mist'
                  )}
                >
                  {filled ? cell : ''}
                </motion.div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
};
