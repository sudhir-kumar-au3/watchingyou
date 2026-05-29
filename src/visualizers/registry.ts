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
import { countingSortModule } from './sorting/countingSort';
import { radixSortModule } from './sorting/radixSort';
import { SortingRenderer } from './sorting/SortingRenderer';
import { SortingControls } from './sorting/SortingControls';
import { bfsModule } from './graphs/bfs';
import { dfsModule } from './graphs/dfs';
import { dijkstraModule } from './graphs/dijkstra';
import { astarModule } from './graphs/astar';
import { topologicalModule } from './graphs/topological';
import { primModule } from './graphs/prim';
import { kruskalModule } from './graphs/kruskal';
import { GraphRenderer } from './graphs/GraphRenderer';
import { GraphControls } from './graphs/GraphControls';
import { GraphLegend } from './graphs/GraphLegend';
import { WeightedGraphControls } from './graphs/WeightedGraphControls';
import { WeightedGraphLegend } from './graphs/WeightedGraphLegend';
import { MstControls } from './graphs/MstControls';
import { RandomGraphControls } from './graphs/RandomGraphControls';
import { MstLegend } from './graphs/MstLegend';
import { KruskalLegend } from './graphs/KruskalLegend';
import { bstModule } from './trees/bst';
import { avlModule } from './trees/avl';
import { TreeRenderer } from './trees/TreeRenderer';
import { TreeControls } from './trees/TreeControls';
import { TreeLegend } from './trees/TreeLegend';
import { AvlControls } from './trees/AvlControls';
import { AvlLegend } from './trees/AvlLegend';
import { heapModule } from './heaps/heap';
import { HeapRenderer } from './heaps/HeapRenderer';
import { HeapLegend } from './heaps/HeapLegend';
import { unionFindModule } from './structures/unionFind';
import { UnionFindRenderer } from './structures/UnionFindRenderer';
import { UnionFindControls } from './structures/UnionFindControls';
import { UnionFindLegend } from './structures/UnionFindLegend';
import { hashTableModule } from './hashing/hashTable';
import { HashRenderer } from './hashing/HashRenderer';
import { HashControls } from './hashing/HashControls';
import { HashLegend } from './hashing/HashLegend';
import { nQueensModule } from './backtracking/nqueens';
import { NQueensRenderer } from './backtracking/NQueensRenderer';
import { NQueensControls } from './backtracking/NQueensControls';
import { NQueensLegend } from './backtracking/NQueensLegend';
import { mazeModule } from './backtracking/maze';
import { MazeRenderer } from './backtracking/MazeRenderer';
import { MazeControls } from './backtracking/MazeControls';
import { MazeLegend } from './backtracking/MazeLegend';
import { lcsModule } from './dp/lcs';
import { editDistanceModule } from './dp/editDistance';
import { knapsackModule } from './dp/knapsack';
import { DpRenderer } from './dp/DpRenderer';
import { DpLegend } from './dp/DpLegend';
import { StringPairControls } from './dp/StringPairControls';
import { KnapsackControls } from './dp/KnapsackControls';
import { Legend } from '@/features/visualizer/Legend';

export type SortVisualModule = VisualModule<SortState, number[]>;

export const sortingModules: SortVisualModule[] = [
  bubbleSortModule,
  quickSortModule,
  mergeSortModule,
  heapSortModule,
  insertionSortModule,
  selectionSortModule,
  countingSortModule,
  radixSortModule,
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

const mstModules: AnyVisualModule[] = [
  defineModule({
    algorithm: primModule,
    Renderer: GraphRenderer,
    Controls: MstControls,
    Legend: MstLegend,
  }),
  defineModule({
    algorithm: kruskalModule,
    Renderer: GraphRenderer,
    Controls: RandomGraphControls,
    Legend: KruskalLegend,
  }),
];

const directedModules: AnyVisualModule[] = [topologicalModule].map((algorithm) =>
  defineModule({
    algorithm,
    Renderer: GraphRenderer,
    Legend: GraphLegend,
  })
);

const treeModules: AnyVisualModule[] = [
  defineModule({
    algorithm: bstModule,
    Renderer: TreeRenderer,
    Controls: TreeControls,
    Legend: TreeLegend,
  }),
  defineModule({
    algorithm: avlModule,
    Renderer: TreeRenderer,
    Controls: AvlControls,
    Legend: AvlLegend,
  }),
  defineModule({
    algorithm: heapModule,
    Renderer: HeapRenderer,
    Controls: TreeControls,
    Legend: HeapLegend,
  }),
];

const structureModules: AnyVisualModule[] = [
  defineModule({
    algorithm: unionFindModule,
    Renderer: UnionFindRenderer,
    Controls: UnionFindControls,
    Legend: UnionFindLegend,
  }),
];

const hashingModules: AnyVisualModule[] = [
  defineModule({
    algorithm: hashTableModule,
    Renderer: HashRenderer,
    Controls: HashControls,
    Legend: HashLegend,
  }),
];

const backtrackingModules: AnyVisualModule[] = [
  defineModule({
    algorithm: nQueensModule,
    Renderer: NQueensRenderer,
    Controls: NQueensControls,
    Legend: NQueensLegend,
  }),
  defineModule({
    algorithm: mazeModule,
    Renderer: MazeRenderer,
    Controls: MazeControls,
    Legend: MazeLegend,
  }),
];

const dpModules: AnyVisualModule[] = [
  defineModule({
    algorithm: lcsModule,
    Renderer: DpRenderer,
    Controls: StringPairControls,
    Legend: DpLegend,
  }),
  defineModule({
    algorithm: editDistanceModule,
    Renderer: DpRenderer,
    Controls: StringPairControls,
    Legend: DpLegend,
  }),
  defineModule({
    algorithm: knapsackModule,
    Renderer: DpRenderer,
    Controls: KnapsackControls,
    Legend: DpLegend,
  }),
];

export const allModules: AnyVisualModule[] = [
  ...sortingModules.map(defineModule),
  ...traversalModules,
  ...pathfindingModules,
  ...mstModules,
  ...directedModules,
  ...treeModules,
  ...structureModules,
  ...hashingModules,
  ...backtrackingModules,
  ...dpModules,
];

export const getModuleById = (id: string): AnyVisualModule | undefined =>
  allModules.find((module) => module.algorithm.id === id);
