import { lazy, Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { usePlaybackHotkeys } from '@/hooks/usePlaybackHotkeys';
import { AppLayout } from './AppLayout';
import { ShortcutsOverlay } from '@/features/help/ShortcutsOverlay';
import { SearchPalette } from '@/features/search/SearchPalette';
import { HomePage } from '@/pages/HomePage';

const VisualizerPage = lazy(() =>
  import('@/pages/VisualizerPage').then((m) => ({ default: m.VisualizerPage }))
);
const ComparePage = lazy(() =>
  import('@/pages/ComparePage').then((m) => ({ default: m.ComparePage }))
);
const ComplexityPage = lazy(() =>
  import('@/pages/ComplexityPage').then((m) => ({ default: m.ComplexityPage }))
);
const CheatsheetPage = lazy(() =>
  import('@/pages/CheatsheetPage').then((m) => ({ default: m.CheatsheetPage }))
);
const PlaygroundPage = lazy(() =>
  import('@/pages/PlaygroundPage').then((m) => ({ default: m.PlaygroundPage }))
);
const GraphLabPage = lazy(() =>
  import('@/pages/GraphLabPage').then((m) => ({ default: m.GraphLabPage }))
);
const EmbedPage = lazy(() =>
  import('@/pages/EmbedPage').then((m) => ({ default: m.EmbedPage }))
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const PageFallback = () => (
  <div className="flex items-center justify-center py-32 text-sm text-haze">
    Loading…
  </div>
);

const Shell = () => (
  <>
    <AppLayout>
      <Outlet />
    </AppLayout>
    <ShortcutsOverlay />
    <SearchPalette />
  </>
);

export const App = () => {
  usePlaybackHotkeys();
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/embed/:id" element={<EmbedPage />} />
        <Route element={<Shell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/algorithm/:id" element={<VisualizerPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/complexity" element={<ComplexityPage />} />
          <Route path="/cheatsheet" element={<CheatsheetPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/graph-lab" element={<GraphLabPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
