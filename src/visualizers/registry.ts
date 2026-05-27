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
import { dijkstraModule } from './graphs/dijkstra';
import { astarModule } from './graphs/astar';
import { GraphRenderer } from './graphs/GraphRenderer';
import { GraphControls } from './graphs/GraphControls';
import { GraphLegend } from './graphs/GraphLegend';
import { WeightedGraphControls } from './graphs/WeightedGraphControls';
import { WeightedGraphLegend } from './graphs/WeightedGraphLegend';
import { bstModule } from './trees/bst';
import { TreeRenderer } from './trees/TreeRenderer';
import { TreeControls } from './trees/TreeControls';
import { TreeLegend } from './trees/TreeLegend';
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

const traversalModules: AnyVisualModule[] = [bfsModule, dfsModule].map(
  (algorithm) =>
    defineModule({
      algorithm,
      Renderer: GraphRenderer,
      Controls: GraphControls,
      Legend: GraphLegend,
    })
);

const pathfindingModules: AnyVisualModule[] = [dijkstraModule, astarModule].map(
  (algorithm) =>
    defineModule({
      algorithm,
      Renderer: GraphRenderer,
      Controls: WeightedGraphControls,
      Legend: WeightedGraphLegend,
    })
);

const treeModules: AnyVisualModule[] = [bstModule].map((algorithm) =>
  defineModule({
    algorithm,
    Renderer: TreeRenderer,
    Controls: TreeControls,
    Legend: TreeLegend,
  })
);

export const allModules: AnyVisualModule[] = [
  ...sortingModules.map(defineModule),
  ...traversalModules,
  ...pathfindingModules,
  ...treeModules,
];

export const getModuleById = (id: string): AnyVisualModule | undefined =>
  allModules.find((module) => module.algorithm.id === id);
