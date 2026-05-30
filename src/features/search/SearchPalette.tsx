import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { allModules } from '@/visualizers/registry';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

const isTyping = (target: EventTarget | null): boolean => {
  const node = target as HTMLElement | null;
  if (!node) return false;
  return (
    node.tagName === 'INPUT' ||
    node.tagName === 'TEXTAREA' ||
    node.isContentEditable
  );
};

const entries = allModules.map((module) => module.algorithm);

export const SearchPalette = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [location.key]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === '/' && !isTyping(event.target) && !open) {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    const onOpen = (): void => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('wy:open-search', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wy:open-search', onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      window.setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (algo) =>
        algo.name.toLowerCase().includes(q) ||
        algo.category.toLowerCase().includes(q)
    );
  }, [query]);

  const go = (id: string): void => {
    setOpen(false);
    navigate(`/algorithm/${id}`);
  };

  const onKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (event.key === 'Enter' && results[selected]) {
      go(results[selected].id);
    }
  };

  if (!open) return null;

  return (
    <div>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-center bg-void/70 p-4 pt-[12vh] backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: -8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(event) => event.stopPropagation()}
            className="glass-strong flex w-full max-w-lg flex-col overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search size={18} className="shrink-0 text-haze" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelected(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search algorithms…"
                className="w-full bg-transparent py-4 font-display text-base text-mist outline-none placeholder:text-haze/60"
              />
            </div>
            <div className="max-h-[50vh] overflow-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-haze">
                  No algorithm matches “{query}”.
                </p>
              ) : (
                results.map((algo, index) => (
                  <button
                    key={algo.id}
                    type="button"
                    onMouseEnter={() => setSelected(index)}
                    onClick={() => go(algo.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition',
                      index === selected ? 'bg-cyan/15' : 'hover:bg-white/5'
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm',
                        index === selected ? 'text-cyan' : 'text-mist'
                      )}
                    >
                      {algo.name}
                    </span>
                    <Badge accent={algo.accent}>{algo.category}</Badge>
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-white/5 px-4 py-2 text-center font-mono text-[10px] text-haze/60">
              ↑↓ to move · ↵ to open · esc to close
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
