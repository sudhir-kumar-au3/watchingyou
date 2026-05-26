import type { VisualModule } from '@/core/engine/types';
import type { SortState } from './sorting/types';
import { bubbleSortModule } from './sorting/bubbleSort';
import { quickSortModule } from './sorting/quickSort';
import { mergeSortModule } from './sorting/mergeSort';
import { heapSortModule } from './sorting/heapSort';
import { insertionSortModule } from './sorting/insertionSort';
import { selectionSortModule } from './sorting/selectionSort';
import { SortingRenderer } from './sorting/SortingRenderer';

export type SortVisualModule = VisualModule<SortState, number[]>;

export const sortingModules: SortVisualModule[] = [
  { algorithm: bubbleSortModule, Renderer: SortingRenderer },
  { algorithm: quickSortModule, Renderer: SortingRenderer },
  { algorithm: mergeSortModule, Renderer: SortingRenderer },
  { algorithm: heapSortModule, Renderer: SortingRenderer },
  { algorithm: insertionSortModule, Renderer: SortingRenderer },
  { algorithm: selectionSortModule, Renderer: SortingRenderer },
];

export const allModules: SortVisualModule[] = [...sortingModules];

export const getModuleById = (id: string): SortVisualModule | undefined =>
  allModules.find((module) => module.algorithm.id === id);
