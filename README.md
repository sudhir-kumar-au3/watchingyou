# WatchingYou

> Interactive algorithm & data structure visualizer. See how code *moves*, not
> just what it returns.

WatchingYou turns algorithm execution into deterministic, reversible animated
timelines. Pick an algorithm, then scrub, step, replay, and change speed while
the source code and complexity profile stay in sync with every frame.

**Live:** https://sudhir-kumar-au3.github.io/watchingyou/

## Status

Live and growing:

- **Eight sorting visualizers** — Bubble, Quick, Merge, Heap, Insertion,
  Selection, Counting, Radix — with synchronized source highlighting, live
  metrics, and complexity panels
- **Searching & strings** — binary search (halve the range), a sliding window
  (shortest subarray summing to ≥ a target), and **KMP** pattern matching with a
  live failure function
- **Trie (prefix tree)** — insert words by shared prefix and look one up
  character by character
- **Graph traversal** — BFS and DFS — on an animated SVG graph
- **Weighted pathfinding** — Dijkstra and A* with edge weights, live distance
  labels, a goal, and the reconstructed shortest path
- **Minimum spanning trees** — Prim's and Kruskal's, growing the tree edge by
  edge; Kruskal colors each node by its **disjoint-set component** so you watch
  the sets merge as edges are kept. Plus topological sort on a directed DAG
- **Floyd-Warshall** — all-pairs shortest paths as a live distance matrix,
  relaxing through one intermediate vertex at a time
- **Bellman-Ford** — single-source shortest paths by relaxing every edge V−1
  times (handles negative weights)
- **Strongly Connected Components** (Kosaraju), **articulation points** (cut
  vertices), and a **bipartite check** — all on the animated graph
- **Trees & heaps** — Binary Search Tree and self-balancing **AVL tree** with
  live balance factors and animated rotations on both **insert and delete**
  (build any sequence of operations interactively), plus a **binary heap** shown
  as a tree *and* its backing array, building then heap-sorting (repeated
  extract-max) in place
- **Union-Find** — a disjoint-set forest with union-by-rank and path compression
  drawn as parent-pointer arcs, colored by set
- **Hashing** — a hash table with separate **chaining** and open-addressing
  **linear probing**, toggled live, showing collisions and probe runs
- **Backtracking** — **N-Queens** (place, reject, backtrack on a live chessboard)
  and a **maze solver** (depth-first search retreating out of every dead end)
- **Math** — Euclidean **GCD**, the **Sieve of Eratosthenes**, **fast
  exponentiation** (binary squaring), and **prime factorization** by trial division
- **Recursion** — **Tower of Hanoi** (disks gliding across pegs) and
  **permutations** (choose → recurse → backtrack)
- **Greedy** — **activity selection** on an interval timeline and **Huffman
  coding** (merge the rarest symbols into an optimal prefix tree)
- **Graph Lab** — build your own graph (click to add nodes, click two to
  connect, drag to arrange) and run any graph algorithm on it
- **Comparison mode** — race two algorithms on one dataset and one clock
- **Code playground** — a real step-through JavaScript interpreter: write
  arbitrary JS and watch variables, arrays, the call stack, recursion depth, and
  console output update live as the highlighted line executes
- Full deterministic, reversible playback (play/pause/step/scrub/speed)
  everywhere

- **Complexity Lab** — run sorts across input sizes and watch the operation-
  count curves reveal O(n log n) vs O(n²); toggle input scenarios
- **Dynamic programming** — LCS, edit distance, 0/1 knapsack, longest increasing
  subsequence, coin change, and subset sum — animated filling grids with
  dependency and back-trace highlighting

- **Sound** — toggle the speaker to *hear* algorithms: each comparison/swap
  plays a tone pitched to the value it touches (great on sorting and heaps)
- **Interview cheat sheet** — a sortable table of every algorithm's Big-O plus
  the classic interview problems each one solves
- **Surprise me** — jump to a random visualizer; **?** opens the shortcuts help
- **Save image** — export the current visualization (with its step caption) as a
  crisp shareable PNG

Scripts: `npm test` (Vitest suite), `npm run verify` (headless render checks
across every route — builds the app and asserts bars/nodes/cells/charts render
error-free). Playback keyboard shortcuts: space, ←/→, R, ? (help).

## Tech

Vite · React 18 · TypeScript (strict) · Tailwind v4 · Zustand · Framer Motion ·
React Router.

## Develop

```bash
npm install
npm run dev        # start the dev server
npm run build      # typecheck + production build
npm run lint       # eslint
npm run typecheck  # tsc, no emit
```

## Architecture

```
src/
  core/          framework-free engine
    timeline/    Frame model, TimelineRecorder, playback math
    engine/      AlgorithmModule / VisualModule contracts
  visualizers/   plug-and-play algorithm modules + renderers
    sorting/     bubble & quick sort + the bar renderer
    registry.ts  module registration
  store/         Zustand playback store
  hooks/         usePlaybackEngine (the timeline clock)
  features/      visualizer panels & gallery cards
  components/    reusable UI primitives
  app/ pages/    shell, routing, screens
  themes/ utils/ design tokens & helpers
```

**Key idea:** an algorithm runs once and emits an immutable list of frames. The
UI just renders the frame at the current index, which makes playback reversible
and deterministic by construction. See [docs/JOURNEY.md](docs/JOURNEY.md) for the
reasoning behind each decision.

## Add an algorithm

1. Create a module exporting an `AlgorithmModule` whose `generate` uses a
   `TimelineRecorder` to capture frames.
2. Pair it with a renderer in a `VisualModule`.
3. Register it in `src/visualizers/registry.ts`.

## Deployment

Pushing to `main` triggers a GitHub Actions workflow that builds and publishes
to GitHub Pages. Enable Pages → Source: GitHub Actions in the repo settings.

## Author

**Sudhir Kumar** — [github.com/sudhir-kumar-au3](https://github.com/sudhir-kumar-au3)

Designed and built as an exploration of how motion can make algorithms legible.
