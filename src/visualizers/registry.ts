import {
  defineModule,
  type AnyVisualModule,
  type VisualModule,
} from '@/core/engine/types';
import type { SortState } from './sorting/types';
import { bubbleSortModule } from './sorting/bubbleSort';
import { quickSortModule } from './sorting/quickSort';
import { mergeSortModule } from './sorting/mergeSort';
import { heapSortModule } from './sorting/heapSort';
import { insertionSortModule } from './sorting/insertionSort';
import { selectionSortModule } from './sorting/selectionSort';
import { SortingRenderer } from './sorting/SortingRenderer';
import { SortingControls } from './sorting/SortingControls';
import { bfsModule } from './graphs/bfs';
import { dfsModule } from './graphs/dfs';
import { GraphRenderer } from './graphs/GraphRenderer';
import { GraphControls } from './graphs/GraphControls';
import { GraphLegend } from './graphs/GraphLegend';
import { Legend } from '@/features/visualizer/Legend';

export type SortVisualModule = VisualModule<SortState, number[]>;

export const sortingModules: SortVisualModule[] = [
  bubbleSortModule,
  quickSortModule,
  mergeSortModule,
  heapSortModule,
  insertionSortModule,
  selectionSortModule,
].map((algorithm) => ({
  algorithm,
  Renderer: SortingRenderer,
  Controls: SortingControls,
  Legend,
}));

const graphModules: AnyVisualModule[] = [bfsModule, dfsModule].map((algorithm) =>
  defineModule({
    algorithm,
    Renderer: GraphRenderer,
    Controls: GraphControls,
    Legend: GraphLegend,
  })
);

export const allModules: AnyVisualModule[] = [
  ...sortingModules.map(defineModule),
  ...graphModules,
];

export const getModuleById = (id: string): AnyVisualModule | undefined =>
  allModules.find((module) => module.algorithm.id === id);
