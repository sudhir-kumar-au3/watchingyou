# WatchingYou

> Interactive algorithm & data structure visualizer. See how code *moves*, not
> just what it returns.

WatchingYou turns algorithm execution into deterministic, reversible animated
timelines. Pick an algorithm, then scrub, step, replay, and change speed while
the source code and complexity profile stay in sync with every frame.

**Live:** https://sudhir-kumar-au3.github.io/watchingyou/

## Status

Live and growing:

- **Six sorting visualizers** — Bubble, Quick, Merge, Heap, Insertion, Selection
  — with synchronized source highlighting, live metrics, and complexity panels
- **Graph traversal** — BFS and DFS — on an animated SVG graph
- **Weighted pathfinding** — Dijkstra and A* with edge weights, live distance
  labels, a goal, and the reconstructed shortest path
- **Binary Search Tree** — animated insertion + in-order traversal with live
  re-layout
- **Comparison mode** — race two algorithms on one dataset and one clock
- **Code playground** — a real step-through JavaScript interpreter: write
  arbitrary JS and watch variables, arrays, the call stack, recursion depth, and
  console output update live as the highlighted line executes
- Full deterministic, reversible playback (play/pause/step/scrub/speed)
  everywhere

- **Complexity Lab** — run sorts across input sizes and watch the operation-
  count curves reveal O(n log n) vs O(n²); toggle input scenarios
- **Dynamic programming** — LCS, edit distance, and 0/1 knapsack as animated
  filling grids with dependency and back-trace highlighting

Scripts: `npm test` (Vitest suite), `npm run verify` (headless render checks
across every route — builds the app and asserts bars/nodes/cells/charts render
error-free). Playback keyboard shortcuts: space, ←/→, R.

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
