# Build Journey — WatchingYou

A running log of the decisions behind this project. Newest entries at the top.
Each entry captures *what* changed and, more importantly, *why* — so future
contributors inherit the reasoning, not just the result.

---

## Entry 06 — Learning depth, DP, and a verification gate

A product-driven round: rather than only adding algorithms, focus on what
makes the app *teach* better, then harden the pipeline.

### Make Big-O visible (Complexity Lab)

We already counted operations — so the Complexity Lab runs each sort across
growing input sizes and plots the comparisons it actually performs. The curve's
shape *is* the complexity: merge sort stays nearly flat while bubble sort bends
upward. Paired with **input scenarios** (sorted / reversed / nearly-sorted /
few-unique), a learner can watch best- and worst-case behaviour diverge — quick
sort degrading on sorted input, bubble sort flying on nearly-sorted.

### Dynamic programming as a filling grid

DP is where most learners stall, and the canonical breakthrough is *seeing the
table fill*. A new `dp` grid state powers LCS, edit distance, and 0/1 knapsack:
each highlights the cell being filled, the dependency cells it reads (amber),
and the optimal back-trace path (green). Three different `TInput` shapes (two
strings; items + capacity) plug into one renderer.

### More sorts

Counting and radix sort — non-comparison sorts — slotted into the existing bar
renderer using the `write` tone, with relabelled metrics (tallies/placements).

### Polish that compounds

- **Keyboard shortcuts** (space, ←/→, R) driving the playback store globally,
  guarded against typing in inputs and the Monaco editor.
- **Route-level code splitting**: the main bundle dropped from 514 KB to
  348 KB; the acorn-powered Playground is now a 146 KB chunk loaded only when
  visited.

### The verification gate

The recurring lesson from earlier entries — "does it load?" missed invisible
bars and a crashing page — finally became infrastructure. `npm run verify`
builds the app and drives headless Chromium across every route, asserting the
things that actually matter: sorting bars have real height, graph nodes render,
DP cells appear, the complexity chart draws curves, and the playground runs
error-free. Visual regressions of that class can't ship unnoticed again. The
unit suite stands at **39 green** alongside it.

---

## Entry 05 — Weighted pathfinding and trees

Two new algorithm families, both leaning on the now-mature module system:
Dijkstra + A* (weighted graphs) and a Binary Search Tree (a third state shape).

### Weighted graphs — one core, two algorithms

Dijkstra and A* are the *same* search with a different priority function, so I
wrote one `traceWeightedSearch(input, heuristic)` core and let each module
supply its heuristic: `() => 0` for Dijkstra, an admissible scaled-Euclidean
estimate for A*. The graph model gained edge weights, per-node distances, a
goal, and a reconstructed path; the existing `GraphRenderer` was extended (not
forked) to draw weight labels, live distance labels, the dashed goal ring, and
the final path in green.

**The A* admissibility trap.** My first heuristic (`euclidean/10`) *over*-
estimated some true costs given the hand-authored integer weights — which can
make A* return a non-optimal path. Rather than fudge the weights, I made the
heuristic provably admissible: scale straight-line distance by the minimum
weight-per-unit-distance ratio in the graph, so it can never exceed real cost.
The tests pin this down: both algorithms must return distance 9 and the exact
path `A→B→E→F→H` on the sample graph.

### Binary Search Tree — layout is the interesting part

Insertion and traversal are textbook; the visual challenge is *placement*. Each
frame recomputes the layout from the current tree: an in-order walk assigns each
node an x by its in-order rank and a y by its depth, so the BST invariant
(left < node < right) reads left-to-right on screen. Nodes spring to their new
positions as the tree grows. The in-order traversal at the end is the payoff —
values light up in sorted order, which a test asserts directly.

### Tests as the safety net

Every pure generator added here is test-first: 5 pathfinding cases (shortest
distance, exact path, full settle) and 3 BST cases (in-order sorted, node
count, single value). Total suite is now **26 green**. A subtle bug surfaced —
my A* heuristic — and the test caught it before any pixel rendered.

The gallery now spans sorting (6), graph traversal (BFS/DFS), pathfinding
(Dijkstra/A*), and trees (BST), plus the step-through interpreter — all on the
same Timeline/playback spine.

---

## Entry 04 — A real step-through interpreter

The Proxy-array playground (Entry 03) could only "see" one array. A user
rightly asked whether it visualizes *any* code — it didn't. So this entry
replaces it with a genuine **tree-walking JavaScript interpreter** that executes
arbitrary code statement by statement.

### Why an interpreter, not instrumentation

To watch *any* code — variables, recursion, the call stack, control flow — you
need to be inside execution, not observing a side channel. I built a recursive
evaluator over acorn's AST that emits a `ProgramState` frame at each statement:
current line, every variable in the live scope chain (with the just-changed one
flagged), the call stack with recursion depth, and console output. It reuses the
exact same `Timeline` + playback machinery as the sorting bars — the engine
abstraction paying off a fourth time.

Supported: declarations, all the operators, if/else, for/while/do-while/for-of,
functions, arrow functions, **recursion and closures**, arrays/objects, member
calls (native methods like `arr.push` and `Math.*` just work because values are
real JS values), `break`/`continue`/`return`, template literals, and
`console.log`.

### Test-first, because an interpreter must be correct

This is the one place where "looks right" isn't enough. I wrote **18 Vitest
cases first** (red), then implemented until green: arithmetic, accumulation
loops, `while`, `break`/`continue`, user functions, **factorial and fibonacci
recursion**, closures, arrow functions, array mutation + a full in-interpreter
bubble sort, objects, and all three safety paths. One failure caught a bug — in
my *test* (I'd miscounted a break/continue sum), which is exactly the kind of
thing tests are for. `npm test` now guards the interpreter on every change.

### Safety

A deterministic step cap (15k) ticks on every statement *and* every loop
iteration, so an empty `while(true){}` is caught at the loop head; plus a
call-depth cap for runaway recursion, an output cap, and structured error
reporting (runtime + syntax) surfaced in the UI instead of crashing.

### Honesty note

This still runs via `new Function`-free evaluation of a JS *subset* — it covers
the common teaching constructs above, not the entire language (no
try/catch/classes/generators/destructuring yet). That's a deliberate, stated
boundary, and the architecture leaves room to grow it.

---

## Entry 03 — Visualizing the user's own code

The Phase 2 flagship: paste a function, watch it run. The hard part is turning
arbitrary code into a frame timeline without building a full interpreter.

### The instrumentation decision

I considered an AST transform (parse → inject trace calls → regenerate source).
It's powerful but heavy: it needs a code generator, careful scope handling, and
TDZ-safe variable snapshots — a lot of surface area to get subtly wrong.

Instead I chose a **Proxy-wrapped array**. The user writes `sort(arr)`; we hand
them a `Proxy` over the real array whose `get` trap records a *read* (a
comparison) and whose `set` trap records a *write* (a mutation). Every trap
emits a frame into the **same `Timeline<SortState>`** the built-in sorts use —
so the playground reuses the entire existing renderer, scrubber, playback, and
metrics stack with zero new visualization code. The instrumentation is the data
structure, not the source.

The trade-off, stated honestly: we capture array *operations*, not arbitrary
statements, and we don't highlight source lines (the Proxy can't see them). For
the sorting domain that's exactly the right granularity, and it generalizes
later to any structure we can wrap in a Proxy.

### Safety

Client-side execution of the user's own code in their own browser is low-risk,
but the PRD calls for real protection. I implemented a deterministic
**operation-count cap** (12k ops) that throws before any infinite loop can hang
the tab, plus try/catch surfacing errors in the UI. Verified directly: bubble
sort traces and sorts correctly, `while(true)` is cut off at the cap, and a
missing `sort` function reports a clear message. True isolation via a **Web
Worker** (with `terminate()` as a hard timeout) is the documented next step —
the op-cap covers the common failure mode today.

### Editor

Monaco via `@monaco-editor/react`, which lazy-loads the editor from a CDN at
runtime. The production bundle grew only ~6 KB gzipped — the heavy editor never
touches our initial load and still works on GitHub Pages.

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
