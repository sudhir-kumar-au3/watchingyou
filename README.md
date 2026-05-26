# WatchingYou

> Interactive algorithm & data structure visualizer. See how code *moves*, not
> just what it returns.

WatchingYou turns algorithm execution into deterministic, reversible animated
timelines. Pick an algorithm, then scrub, step, replay, and change speed while
the source code and complexity profile stay in sync with every frame.

**Live:** https://sudhir-kumar-au3.github.io/watchingyou/

## Status

First vertical slice is live: a complete sorting visualizer (**Bubble Sort** and
**Quick Sort**) with full playback, dataset controls, synchronized code
highlighting, live metrics, and an educational panel. Built as the foundation
for the broader platform described in the project requirements.

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
