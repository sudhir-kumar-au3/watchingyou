import type { VisualModule } from '@/core/engine/types';
import type { SortState } from './sorting/types';
import { bubbleSortModule } from './sorting/bubbleSort';
import { quickSortModule } from './sorting/quickSort';
import { SortingRenderer } from './sorting/SortingRenderer';

export type SortVisualModule = VisualModule<SortState, number[]>;

export const sortingModules: SortVisualModule[] = [
  { algorithm: bubbleSortModule, Renderer: SortingRenderer },
  { algorithm: quickSortModule, Renderer: SortingRenderer },
];

export const allModules: SortVisualModule[] = [...sortingModules];

export const getModuleById = (id: string): SortVisualModule | undefined =>
  allModules.find((module) => module.algorithm.id === id);
