# Build Journey — WatchingYou

A running log of the decisions behind this project. Newest entries at the top.
Each entry captures *what* changed and, more importantly, *why* — so future
contributors inherit the reasoning, not just the result.

---

## Entry 02 — Breadth (more sorts), comparison mode, and the second state shape

Three things landed: four more sorting algorithms, a side-by-side comparison
mode, and graph traversal (BFS/DFS) — the last of which forced the registry to
grow up.

### More sorting (cheap, by design)

Adding Merge, Heap, Insertion, and Selection sort was one file + one registry
line each, exactly as the module contract promised. Merge sort writes values
back rather than swapping, so it introduced a new **`write` tone** (amber) — a
reminder that the visual vocabulary should grow with the algorithms, not be
frozen up front. A color legend now makes the tones self-documenting.

### Comparison mode — the honest race

The key decision: two algorithms share **one dataset and one playback clock**,
but each lane renders the frame at `min(index, itsOwnLastFrame)`. The faster
algorithm visibly finishes and waits while the slower one grinds on. I rejected
normalizing the two timelines to equal length — that would hide the very thing
we're trying to teach (how many more operations the slower one performs). The
gap you see is the gap that matters.

### Generalizing the registry (the real work)

Sorting bars and graph nodes are different `TState` shapes, so a single typed
list couldn't hold both without either `any` (banned by our lint rules) or a
type-erasure boundary. I chose a controlled boundary: `defineModule()` performs
exactly one `as unknown as` cast, turning a fully-typed `VisualModule<S, I>`
into an `AnyVisualModule`. It's sound because the same module supplies both the
`generate` that produces `Frame<S>` and the `Renderer` that consumes it — they
can't desync.

The bigger move: **modules now own their UI surface**. `VisualModule` gained
optional `Controls`, `Legend`, and `metricLabels`. The result is that
`VisualizerPage` contains **zero** knowledge of sorting or graphs — it renders
whatever the module hands it. Sorting brings a bar renderer + size/shuffle
controls; graphs bring an SVG node renderer + start-node picker + "edges
checked / nodes visited" metric labels. Adding a category no longer touches the
page. This is the moment the "engine" earned its name.

### Graph rendering choice

I rendered graphs with **plain SVG + Framer Motion**, not React Flow or D3.
React Flow is built for interactive node editors (dragging, connecting) — we
need deterministic, animated *playback*, which is exactly what the frame model
already gives us. Hand-rolled SVG keeps the bundle lean and the animation under
the same spring system as the bars. React Flow stays on the table for a future
interactive graph *builder*, where its strengths actually apply.

---

## Entry 01 — Foundations & the first vertical slice

**Goal of this pass:** ship a real, runnable, deployable slice rather than a
half-wired skeleton. One full path works end to end: pick a sorting algorithm →
watch deterministic, reversible playback → scrub, step, change speed, swap the
dataset → read the synchronized source and complexity profile.

### Architectural decisions

- **Pure engine, separated from UI.** Everything under `src/core/` is
  framework-free TypeScript. The timeline is just data: an algorithm runs once
  and emits an immutable array of `Frame<TState>` snapshots. React never drives
  the algorithm; it only renders the frame at the current index. This is the
  single most important decision in the codebase — it makes playback trivially
  **reversible** (seeking is array indexing), **deterministic** (no animation
  state to desync), and **testable** (frames are plain objects).

- **`TimelineRecorder` as the authoring API.** Algorithms don't manually build
  frames; they call `recorder.capture(state, description, lines)` and
  `recorder.countComparison()` / `countSwap()` / `countAccess()`. The recorder
  deep-clones each snapshot (`structuredClone`) so mutation-in-place algorithms
  (the natural way to write sort code) stay correct without defensive copying
  noise leaking into the algorithm body.

- **Plug-and-play module contract.** Every visualizer is an
  `AlgorithmModule<TState, TInput>` (metadata + `generate`) paired with a
  `Renderer` into a `VisualModule`. Adding an algorithm is: write one file,
  register one line. This is the seed of the "Custom Visualization SDK" from the
  PRD.

- **State lives in the right place.** Playback state (index, status, speed) is
  in a small Zustand store — it's global and many components read it. The frame
  *data* deliberately stays out of the store (it can be large and changes when
  the dataset changes); the page generates it with `useMemo` and feeds only the
  frame count to the store. A dedicated `usePlaybackEngine` hook owns the timer,
  keeping the store pure and side-effect-free.

### UI/UX decisions (free-spirited, futuristic)

- **Dark-first, deep-space palette.** A near-black `void` base with layered
  radial cyan/violet glows fixed to the viewport. Glassmorphism panels
  (`backdrop-blur` + subtle gradients) float above it. The aesthetic target:
  Linear/Vercel restraint with Observable's "data is alive" energy.

- **Color *is* the explanation.** Bars are tinted by role — cyan = comparing,
  rose = swapping, lime = sorted, violet = pivot — with matching glow. A learner
  should understand the step from color alone before reading the caption.

- **Spring physics over linear tweens.** Bar height/color transitions use
  Framer Motion springs so swaps feel physical, not mechanical. "Motion
  communicates logic" is treated as a hard requirement, not decoration.

- **Accessibility from day one.** `prefers-reduced-motion` collapses all
  animation; every control has an `aria-label`; speed buttons expose
  `aria-pressed`; focus-visible rings everywhere. Polished ≠ exclusionary.

### Deliberate scope cuts (revisit later)

- Monaco editor, D3, and React Flow are **not** installed yet. The slice is
  sorting-only, so pulling them in now would be dead weight in the bundle. They
  arrive with the code-to-visualization engine and graph visualizers.
- Routing uses `HashRouter`. It's the most robust option for GitHub Pages
  (no server rewrites, no 404-fallback hack). Revisit if we move to a host with
  real SPA fallback.
- The registry is concretely typed to `VisualModule<SortState, number[]>`. When
  a second state shape lands (graphs, trees) we'll generalize it — chosen over
  premature `any`/erasure that would have cost type safety today.

### Stack as built

Vite 5 · React 18 · TypeScript (strict) · Tailwind v4 (`@tailwindcss/vite`,
CSS-first `@theme`) · Zustand · Framer Motion · React Router (Hash) ·
lucide-react. Strict engineering rules from the PRD enforced: no comments in
production code, strong typing throughout, feature-based folders, no monoliths.

### Verified

`tsc -b` clean · `eslint .` clean · `vite build` succeeds (~100 KB gz) · dev
server boots and serves under the `/watchingyou/` base path.
