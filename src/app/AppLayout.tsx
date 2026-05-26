import type { ReactNode } from 'react';
import { Github } from 'lucide-react';
import { Brand } from './Brand';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => (
  <div className="flex min-h-full flex-col">
    <header className="sticky top-0 z-30 border-b border-white/5 bg-void/60 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 py-3.5">
        <Brand />
        <a
          href="https://github.com/sudhir-kumar-au3/watchingyou"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl glass px-3.5 py-2 text-sm text-haze transition hover:text-cyan"
        >
          <Github size={16} />
          <span className="hidden sm:inline">Source</span>
        </a>
      </div>
    </header>

    <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-8">
      {children}
    </main>

    <footer className="border-t border-white/5 py-6 text-center text-xs text-haze">
      Built for explorers · Motion communicates logic
    </footer>
  </div>
);
