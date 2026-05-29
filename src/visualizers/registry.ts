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
import { floydWarshallModule } from './graphs/floydWarshall';
import { FloydMatrixRenderer } from './graphs/FloydMatrixRenderer';
import { FloydWarshallControls } from './graphs/FloydWarshallControls';
import { FloydLegend } from './graphs/FloydLegend';
import { bellmanFordModule } from './graphs/bellmanFord';
import { bipartiteModule } from './graphs/bipartite';
import { BipartiteLegend } from './graphs/BipartiteLegend';
import { sccModule } from './graphs/scc';
import { SccLegend } from './graphs/SccLegend';
import { articulationModule } from './graphs/articulation';
import { ArticulationLegend } from './graphs/ArticulationLegend';
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
import { trieModule } from './structures/trie';
import { TrieRenderer } from './structures/TrieRenderer';
import { TrieControls } from './structures/TrieControls';
import { TrieLegend } from './structures/TrieLegend';
import { hashTableModule } from './hashing/hashTable';
import { HashRenderer } from './hashing/HashRenderer';
import { HashControls } from './hashing/HashControls';
import { HashLegend } from './hashing/HashLegend';
import { binarySearchModule } from './searching/binarySearch';
import { BinarySearchRenderer } from './searching/BinarySearchRenderer';
import { BinarySearchControls } from './searching/BinarySearchControls';
import { BinarySearchLegend } from './searching/BinarySearchLegend';
import { slidingWindowModule } from './searching/slidingWindow';
import { SlidingWindowRenderer } from './searching/SlidingWindowRenderer';
import { SlidingWindowControls } from './searching/SlidingWindowControls';
import { SlidingWindowLegend } from './searching/SlidingWindowLegend';
import { kmpModule } from './searching/kmp';
import { KmpRenderer } from './searching/KmpRenderer';
import { KmpControls } from './searching/KmpControls';
import { KmpLegend } from './searching/KmpLegend';
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
import { lisModule } from './dp/lis';
import { coinChangeModule } from './dp/coinChange';
import { subsetSumModule } from './dp/subsetSum';
import { DpRenderer } from './dp/DpRenderer';
import { DpLegend } from './dp/DpLegend';
import { StringPairControls } from './dp/StringPairControls';
import { KnapsackControls } from './dp/KnapsackControls';
import { LisControls } from './dp/LisControls';
import { CoinChangeControls } from './dp/CoinChangeControls';
import { SubsetSumControls } from './dp/SubsetSumControls';
import { gcdModule } from './math/gcd';
import { GcdRenderer } from './math/GcdRenderer';
import { GcdControls } from './math/GcdControls';
import { GcdLegend } from './math/GcdLegend';
import { sieveModule } from './math/sieve';
import { SieveRenderer } from './math/SieveRenderer';
import { SieveControls } from './math/SieveControls';
import { SieveLegend } from './math/SieveLegend';
import { fastPowModule } from './math/fastPow';
import { FastPowRenderer } from './math/FastPowRenderer';
import { FastPowControls } from './math/FastPowControls';
import { FastPowLegend } from './math/FastPowLegend';
import { factorizeModule } from './math/factorize';
import { FactorizeRenderer } from './math/FactorizeRenderer';
import { FactorizeControls } from './math/FactorizeControls';
import { FactorizeLegend } from './math/FactorizeLegend';
import { hanoiModule } from './recursion/hanoi';
import { HanoiRenderer } from './recursion/HanoiRenderer';
import { HanoiControls } from './recursion/HanoiControls';
import { HanoiLegend } from './recursion/HanoiLegend';
import { permutationsModule } from './recursion/permutations';
import { PermutationsRenderer } from './recursion/PermutationsRenderer';
import { PermutationsControls } from './recursion/PermutationsControls';
import { PermutationsLegend } from './recursion/PermutationsLegend';
import { activitySelectionModule } from './greedy/activitySelection';
import { ActivityRenderer } from './greedy/ActivityRenderer';
import { ActivityControls } from './greedy/ActivityControls';
import { ActivityLegend } from './greedy/ActivityLegend';
import { huffmanModule } from './greedy/huffman';
import { HuffmanRenderer } from './greedy/HuffmanRenderer';
import { HuffmanControls } from './greedy/HuffmanControls';
import { HuffmanLegend } from './greedy/HuffmanLegend';
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

const pathfindingModules: AnyVisualModule[] = [
  dijkstraModule,
  astarModule,
  bellmanFordModule,
].map((algorithm) =>
  defineModule({
    algorithm,
    Renderer: GraphRenderer,
    Controls: WeightedGraphControls,
    Legend: WeightedGraphLegend,
  })
);

const advancedGraphModules: AnyVisualModule[] = [
  defineModule({
    algorithm: bipartiteModule,
    Renderer: GraphRenderer,
    Controls: GraphControls,
    Legend: BipartiteLegend,
  }),
  defineModule({
    algorithm: sccModule,
    Renderer: GraphRenderer,
    Legend: SccLegend,
  }),
  defineModule({
    algorithm: articulationModule,
    Renderer: GraphRenderer,
    Controls: GraphControls,
    Legend: ArticulationLegend,
  }),
];

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

const allPairsModules: AnyVisualModule[] = [
  defineModule({
    algorithm: floydWarshallModule,
    Renderer: FloydMatrixRenderer,
    Controls: FloydWarshallControls,
    Legend: FloydLegend,
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
  defineModule({
    algorithm: trieModule,
    Renderer: TrieRenderer,
    Controls: TrieControls,
    Legend: TrieLegend,
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

const searchingModules: AnyVisualModule[] = [
  defineModule({
    algorithm: binarySearchModule,
    Renderer: BinarySearchRenderer,
    Controls: BinarySearchControls,
    Legend: BinarySearchLegend,
  }),
  defineModule({
    algorithm: slidingWindowModule,
    Renderer: SlidingWindowRenderer,
    Controls: SlidingWindowControls,
    Legend: SlidingWindowLegend,
  }),
  defineModule({
    algorithm: kmpModule,
    Renderer: KmpRenderer,
    Controls: KmpControls,
    Legend: KmpLegend,
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
  defineModule({
    algorithm: lisModule,
    Renderer: DpRenderer,
    Controls: LisControls,
    Legend: DpLegend,
  }),
  defineModule({
    algorithm: coinChangeModule,
    Renderer: DpRenderer,
    Controls: CoinChangeControls,
    Legend: DpLegend,
  }),
  defineModule({
    algorithm: subsetSumModule,
    Renderer: DpRenderer,
    Controls: SubsetSumControls,
    Legend: DpLegend,
  }),
];

const mathModules: AnyVisualModule[] = [
  defineModule({
    algorithm: gcdModule,
    Renderer: GcdRenderer,
    Controls: GcdControls,
    Legend: GcdLegend,
  }),
  defineModule({
    algorithm: sieveModule,
    Renderer: SieveRenderer,
    Controls: SieveControls,
    Legend: SieveLegend,
  }),
  defineModule({
    algorithm: fastPowModule,
    Renderer: FastPowRenderer,
    Controls: FastPowControls,
    Legend: FastPowLegend,
  }),
  defineModule({
    algorithm: factorizeModule,
    Renderer: FactorizeRenderer,
    Controls: FactorizeControls,
    Legend: FactorizeLegend,
  }),
];

const recursionModules: AnyVisualModule[] = [
  defineModule({
    algorithm: hanoiModule,
    Renderer: HanoiRenderer,
    Controls: HanoiControls,
    Legend: HanoiLegend,
  }),
  defineModule({
    algorithm: permutationsModule,
    Renderer: PermutationsRenderer,
    Controls: PermutationsControls,
    Legend: PermutationsLegend,
  }),
];

const greedyModules: AnyVisualModule[] = [
  defineModule({
    algorithm: activitySelectionModule,
    Renderer: ActivityRenderer,
    Controls: ActivityControls,
    Legend: ActivityLegend,
  }),
  defineModule({
    algorithm: huffmanModule,
    Renderer: HuffmanRenderer,
    Controls: HuffmanControls,
    Legend: HuffmanLegend,
  }),
];

export const allModules: AnyVisualModule[] = [
  ...sortingModules.map(defineModule),
  ...searchingModules,
  ...traversalModules,
  ...pathfindingModules,
  ...mstModules,
  ...allPairsModules,
  ...advancedGraphModules,
  ...directedModules,
  ...treeModules,
  ...structureModules,
  ...hashingModules,
  ...backtrackingModules,
  ...recursionModules,
  ...greedyModules,
  ...dpModules,
  ...mathModules,
];

export const getModuleById = (id: string): AnyVisualModule | undefined =>
  allModules.find((module) => module.algorithm.id === id);
