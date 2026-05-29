import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Panel';
import { allModules } from '@/visualizers/registry';
import { cn } from '@/utils/cn';

const INTERVIEW_NOTES: Record<string, string> = {
  'bubble-sort': 'Teaching baseline; detect an already-sorted pass',
  'quick-sort': 'Kth largest element · sort colors',
  'merge-sort': 'Count inversions · merge k sorted lists',
  'heap-sort': 'Top-K frequent · sort with O(1) space',
  'insertion-sort': 'Sort a nearly-sorted / streaming list',
  'selection-sort': 'Fewest swaps to sort',
  'counting-sort': 'Sort small-range integers in O(n+k)',
  'radix-sort': 'Maximum gap · sort large integers',
  bfs: 'Shortest path in an unweighted grid · word ladder',
  dfs: 'Number of islands · clone graph · flood fill',
  dijkstra: 'Network delay time · cheapest flights within K stops',
  astar: 'Grid/▢ map pathfinding with a heuristic',
  topological: 'Course schedule · alien dictionary',
  prim: 'Min cost to connect all points',
  kruskal: 'Connecting cities with minimum total cost',
  bst: 'Validate BST · kth smallest element',
  'avl-tree': 'Design a balanced ordered map/set',
  'binary-heap': 'Find median from a stream · merge k lists',
  'union-find': 'Number of provinces · redundant connection · accounts merge',
  'hash-table': 'Two sum · group anagrams · LRU cache',
  lcs: 'Longest common subsequence · diff tools',
  'edit-distance': 'Edit distance · fuzzy string matching',
  knapsack: 'Partition equal subset sum · coin change',
};

const RANK: Record<string, number> = {
  'O(1)': 1,
  'O(α(n))': 2,
  'O(α(n)) amortised': 2,
  'O(log n)': 3,
  'O(√n)': 3.5,
  'O(n)': 4,
  'O(n + k)': 4.2,
  'O(nk)': 4.4,
  'O(n·m)': 4.5,
  'O(nm)': 4.5,
  'O(E + V log V)': 4.7,
  'O(E log E)': 4.7,
  'O(n log n)': 5,
  'O(V²)': 5.8,
  'O(n²)': 6,
  'O(n^2)': 6,
  'O(2^n)': 7,
};

const rankOf = (value: string): number => RANK[value] ?? 4.5;

type SortKey = 'name' | 'category' | 'best' | 'average' | 'worst' | 'space';

interface Row {
  id: string;
  name: string;
  category: string;
  accent: string;
  best: string;
  average: string;
  worst: string;
  space: string;
  solves: string;
}

const HEADERS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Algorithm' },
  { key: 'category', label: 'Category' },
  { key: 'best', label: 'Best' },
  { key: 'average', label: 'Average' },
  { key: 'worst', label: 'Worst' },
  { key: 'space', label: 'Space' },
];

export const CheatsheetPage = () => {
  const [sortKey, setSortKey] = useState<SortKey>('category');
  const [asc, setAsc] = useState(true);

  const rows = useMemo<Row[]>(
    () =>
      allModules.map((module) => {
        const { algorithm } = module;
        const c = algorithm.info.complexity;
        return {
          id: algorithm.id,
          name: algorithm.name,
          category: algorithm.category,
          accent: algorithm.accent,
          best: c.timeBest,
          average: c.timeAverage,
          worst: c.timeWorst,
          space: c.space,
          solves: INTERVIEW_NOTES[algorithm.id] ?? '—',
        };
      }),
    []
  );

  const sorted = useMemo(() => {
    const factor = asc ? 1 : -1;
    const value = (row: Row): string | number => {
      if (sortKey === 'name' || sortKey === 'category') return row[sortKey];
      return rankOf(row[sortKey]);
    };
    return [...rows].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      if (va < vb) return -1 * factor;
      if (va > vb) return 1 * factor;
      return a.name.localeCompare(b.name);
    });
  }, [rows, sortKey, asc]);

  const onSort = (key: SortKey): void => {
    if (key === sortKey) {
      setAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setAsc(true);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-cyan">Interview cheat sheet</span>
        <h1 className="font-display text-3xl font-bold text-mist">
          Every algorithm, every complexity, at a glance
        </h1>
        <p className="max-w-2xl text-sm text-haze">
          Sortable Big-O for everything in the gallery, plus the classic
          interview problems each one unlocks. Click a row to watch it run.
        </p>
      </div>

      <Panel strong className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-haze">
              {HEADERS.map(({ key, label }) => (
                <th key={key} className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => onSort(key)}
                    className={cn(
                      'inline-flex items-center gap-1 transition hover:text-mist',
                      sortKey === key && 'text-cyan'
                    )}
                  >
                    {label}
                    {sortKey === key &&
                      (asc ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 font-medium">Shows up as</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.id}
                className="border-b border-white/5 transition hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/algorithm/${row.id}`}
                    className="font-medium text-mist transition hover:text-cyan"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge accent={row.accent}>{row.category}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-lime">{row.best}</td>
                <td className="px-4 py-3 font-mono text-xs text-cyan">
                  {row.average}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-rose">
                  {row.worst}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-haze">
                  {row.space}
                </td>
                <td className="px-4 py-3 text-xs text-haze">{row.solves}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <p className="text-center font-mono text-[11px] text-haze/60">
        Time complexity colour-coded · best · average · worst · space
      </p>
    </div>
  );
};
