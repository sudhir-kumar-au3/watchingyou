import { motion } from 'framer-motion';
import { Code2, Sparkles, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AlgorithmCard } from '@/features/gallery/AlgorithmCard';
import { allModules } from '@/visualizers/registry';
import type { AlgorithmCategory } from '@/core/engine/types';

const CATEGORIES: { key: AlgorithmCategory; title: string }[] = [
  { key: 'sorting', title: 'Sorting' },
  { key: 'graph', title: 'Graphs' },
  { key: 'searching', title: 'Searching' },
  { key: 'dp', title: 'Dynamic Programming' },
  { key: 'tree', title: 'Trees' },
  { key: 'backtracking', title: 'Backtracking' },
];

export const HomePage = () => (
  <div className="flex flex-col gap-12">
    <section className="flex flex-col items-center gap-6 py-12 text-center">
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-haze"
      >
        <Sparkles size={13} className="text-cyan" />
        Watch algorithms think, step by step
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-mist sm:text-6xl"
      >
        See how code{' '}
        <span className="text-cyan neon-text">moves</span>,
        <br />
        not just what it returns.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="max-w-xl text-base leading-relaxed text-haze"
      >
        Deterministic, reversible playback of every comparison, swap, and state
        transition. Scrub the timeline, change the speed, and explore the
        mechanics behind each algorithm.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          to="/playground"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan px-5 py-3 font-medium text-void shadow-glow transition hover:brightness-110 active:scale-95"
        >
          <Code2 size={18} />
          Step through your code
        </Link>
        <Link
          to="/compare"
          className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-medium text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
        >
          <Swords size={18} />
          Race two algorithms
        </Link>
      </motion.div>
    </section>

    {CATEGORIES.map(({ key, title }) => {
      const modules = allModules.filter(
        (module) => module.algorithm.category === key
      );
      if (modules.length === 0) return null;
      return (
        <section key={key} className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold text-mist">
              {title}
            </h2>
            <span className="font-mono text-xs text-haze">
              {modules.length} visualizers
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => (
              <AlgorithmCard
                key={module.algorithm.id}
                algorithm={module.algorithm}
                index={index}
              />
            ))}
          </div>
        </section>
      );
    })}
  </div>
);
