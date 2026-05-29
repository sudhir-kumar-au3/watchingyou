import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { allModules } from '@/visualizers/registry';
import type { AlgorithmCategory } from '@/core/engine/types';
import { cn } from '@/utils/cn';

const CATEGORY_LABEL: Record<AlgorithmCategory, string> = {
  sorting: 'Sorting',
  searching: 'Searching',
  graph: 'Graphs',
  dp: 'Dynamic Programming',
  tree: 'Trees & Heaps',
  hashing: 'Hashing',
  structure: 'Data Structures',
  backtracking: 'Backtracking',
  math: 'Math',
  recursion: 'Recursion',
  greedy: 'Greedy',
};

interface AlgorithmSwitcherProps {
  id: string;
  category: AlgorithmCategory;
}

export const AlgorithmSwitcher = ({ id, category }: AlgorithmSwitcherProps) => {
  const navigate = useNavigate();

  const siblings = useMemo(
    () => allModules.filter((module) => module.algorithm.category === category),
    [category]
  );

  const grouped = useMemo(() => {
    const map = new Map<AlgorithmCategory, typeof allModules>();
    for (const module of allModules) {
      const key = module.algorithm.category;
      const list = map.get(key) ?? [];
      list.push(module);
      map.set(key, list);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-[11px] uppercase tracking-wide text-haze">
        {CATEGORY_LABEL[category]}
      </span>
      {siblings.map((entry) => {
        const active = entry.algorithm.id === id;
        return (
          <Link
            key={entry.algorithm.id}
            to={`/algorithm/${entry.algorithm.id}`}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm transition',
              active ? 'bg-cyan/15 text-cyan' : 'glass text-haze hover:text-mist'
            )}
          >
            {entry.algorithm.name}
          </Link>
        );
      })}
      <div className="relative ml-auto">
        <select
          value={id}
          aria-label="Jump to another algorithm"
          onChange={(event) => navigate(`/algorithm/${event.target.value}`)}
          className={cn(
            'cursor-pointer appearance-none rounded-lg glass py-1.5 pl-3 pr-8 text-sm text-haze',
            'outline-none transition hover:text-cyan focus:text-cyan'
          )}
        >
          {grouped.map(([cat, mods]) => (
            <optgroup key={cat} label={CATEGORY_LABEL[cat]} className="bg-abyss">
              {mods.map((module) => (
                <option
                  key={module.algorithm.id}
                  value={module.algorithm.id}
                  className="bg-abyss text-mist"
                >
                  {module.algorithm.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-haze"
        />
      </div>
    </div>
  );
};
