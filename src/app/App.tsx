import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { HomePage } from '@/pages/HomePage';
import { VisualizerPage } from '@/pages/VisualizerPage';
import { ComparePage } from '@/pages/ComparePage';
import { ComplexityPage } from '@/pages/ComplexityPage';
import { PlaygroundPage } from '@/pages/PlaygroundPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const App = () => (
  <AppLayout>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/algorithm/:id" element={<VisualizerPage />} />
      <Route path="/compare" element={<ComparePage />} />
      <Route path="/complexity" element={<ComplexityPage />} />
      <Route path="/playground" element={<PlaygroundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </AppLayout>
);
