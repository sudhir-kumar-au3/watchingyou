import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';

const SHORTCUTS: { keys: string[]; action: string }[] = [
  { keys: ['Space'], action: 'Play / pause' },
  { keys: ['←', '→'], action: 'Step backward / forward' },
  { keys: ['R'], action: 'Restart from the first frame' },
  { keys: ['?'], action: 'Toggle this help' },
];

const isTyping = (target: EventTarget | null): boolean => {
  const node = target as HTMLElement | null;
  if (!node) return false;
  return (
    node.tagName === 'INPUT' ||
    node.tagName === 'TEXTAREA' ||
    node.isContentEditable
  );
};

export const ShortcutsOverlay = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === '?' && !isTyping(event.target)) {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Keyboard shortcuts"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full glass text-haze shadow-glow transition hover:text-cyan active:scale-95"
      >
        <HelpCircle size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(event) => event.stopPropagation()}
              className="glass-strong w-full max-w-sm rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-mist">
                  Keyboard shortcuts
                </h2>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="text-haze transition hover:text-mist"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {SHORTCUTS.map(({ keys, action }) => (
                  <div key={action} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-haze">{action}</span>
                    <span className="flex gap-1.5">
                      {keys.map((key) => (
                        <kbd
                          key={key}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-mist"
                        >
                          {key}
                        </kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs text-haze/70">
                Tip: drag the timeline to scrub to any step, and toggle the speaker
                to hear comparisons as tones.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
