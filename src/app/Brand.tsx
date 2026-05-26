import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

export const Brand = () => (
  <Link to="/" className="group flex items-center gap-2.5">
    <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-cyan/15 text-cyan shadow-glow">
      <Eye size={18} />
      <span className="absolute inset-0 rounded-xl ring-1 ring-cyan/40 transition group-hover:ring-cyan/70" />
    </span>
    <span className="flex flex-col leading-none">
      <span className="font-display text-lg font-semibold tracking-tight text-mist">
        Watching<span className="text-cyan neon-text">You</span>
      </span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-haze">
        Algorithm Visualizer
      </span>
    </span>
  </Link>
);
