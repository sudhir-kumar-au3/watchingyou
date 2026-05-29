import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { AlgorithmModule } from '@/core/engine/types';
import { useLibraryStore } from '@/store/libraryStore';

interface AlgorithmCardProps {
  algorithm: AlgorithmModule<unknown, unknown>;
  index: number;
}

export const AlgorithmCard = ({ algorithm, index }: AlgorithmCardProps) => {
  const isFavorite = useLibraryStore((state) =>
    state.favorites.includes(algorithm.id)
  );
  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.06, ease: 'easeOut' }}
    >
      <Link
        to={`/algorithm/${algorithm.id}`}
        className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl glass p-6 transition hover:-translate-y-1"
        style={{ boxShadow: '0 1px 0 rgb(255 255 255 / 0.05) inset' }}
      >
        <span
          className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: algorithm.accent }}
        />
        <div className="flex items-start justify-between">
          <Badge accent={algorithm.accent}>{algorithm.category}</Badge>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorite}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleFavorite(algorithm.id);
              }}
              className="text-haze transition hover:text-amber"
            >
              <Star
                size={17}
                className={isFavorite ? 'text-amber' : ''}
                fill={isFavorite ? '#fbbf24' : 'none'}
              />
            </button>
            <ArrowUpRight
              size={20}
              className="text-haze transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-mist"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-xl font-semibold text-mist">
            {algorithm.name}
          </h3>
          <p className="text-sm leading-relaxed text-haze">{algorithm.tagline}</p>
        </div>
        <div className="mt-auto flex items-center gap-3 pt-2 font-mono text-xs text-haze">
          <span>avg {algorithm.info.complexity.timeAverage}</span>
          <span className="h-1 w-1 rounded-full bg-edge" />
          <span>space {algorithm.info.complexity.space}</span>
        </div>
      </Link>
    </motion.div>
  );
};
