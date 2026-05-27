import { useMemo, useState } from 'react';
import { LineChartIcon } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { LineChart, type ChartSeries } from '@/components/ui/LineChart';
import { sortingModules } from '@/visualizers/registry';
import {
  makeScenario,
  SCENARIOS,
  type Scenario,
} from '@/visualizers/sorting/types';
import { cn } from '@/utils/cn';

const SIZES = [8, 16, 24, 32, 40, 48];
const DEFAULT_SELECTED = ['bubble-sort', 'quick-sort', 'merge-sort'];

export const ComplexityPage = () => {
  const [scenario, setScenario] = useState<Scenario>('random');
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);

  const series = useMemo<ChartSeries[]>(() => {
    return sortingModules
      .filter((module) => selected.includes(module.algorithm.id))
      .map((module) => ({
        label: module.algorithm.name,
        color: module.algorithm.accent,
        points: SIZES.map((size) => {
          const input = makeScenario(scenario, size);
          const frames = module.algorithm.generate(input).frames;
          const last = frames[frames.length - 1];
          return { x: size, y: last.metrics.comparisons };
        }),
      }));
  }, [scenario, selected]);

  const toggle = (id: string): void => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-2 text-sm text-cyan">
          <LineChartIcon size={16} />
          Complexity lab
        </span>
        <h1 className="font-display text-3xl font-bold text-mist">
          Watch Big-O happen
        </h1>
        <p className="max-w-2xl text-sm text-haze">
          Each algorithm runs across growing input sizes; the chart plots the
          comparisons it actually performs. The shape of the curve is the
          complexity — flat-ish for O(n log n), steeply bending for O(n²).
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wide text-haze">
            Scenario
          </span>
          {SCENARIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScenario(item.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs transition',
                scenario === item.id
                  ? 'bg-cyan/15 text-cyan'
                  : 'glass text-haze hover:text-mist'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wide text-haze">
            Algorithms
          </span>
          {sortingModules.map((module) => {
            const active = selected.includes(module.algorithm.id);
            return (
              <button
                key={module.algorithm.id}
                type="button"
                onClick={() => toggle(module.algorithm.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition',
                  active ? 'text-mist' : 'text-haze/60'
                )}
                style={{
                  background: active ? `${module.algorithm.accent}22` : undefined,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: active
                      ? module.algorithm.accent
                      : 'var(--color-edge)',
                  }}
                />
                {module.algorithm.name}
              </button>
            );
          })}
        </div>
      </div>

      <Panel strong className="p-5">
        {series.length === 0 ? (
          <p className="py-16 text-center text-sm text-haze">
            Select at least one algorithm.
          </p>
        ) : (
          <LineChart
            series={series}
            xLabel="Input size (n)"
            yLabel="Comparisons"
          />
        )}
      </Panel>

      <p className="text-xs text-haze">
        Comparisons are counted from each algorithm's real execution on the
        chosen input. Random uses a single sample, so its curve wobbles; sorted
        and reversed are deterministic — try them to see best- and worst-case
        behaviour diverge.
      </p>
    </div>
  );
};
