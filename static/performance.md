# Svelte Globe Performance Guide

Use this file when the globe already works and you need to reduce GPU cost, animation overhead, or client-side work.

This guide is intentionally deeper than the live `/performance` page so AI assistants can reason about COBE-specific tradeoffs without scraping the UI.

## Recommended Reading Order

1. `/setup.md`
2. `/usage.md`
3. `/performance.md`
4. `/examples.md`

## Performance Defaults

Start here unless you have a strong reason not to:

- `mapSamples: 12000` to `16000` for most normal layouts
- `mapSamples: 8000` for mobile, low-end devices, or dense pages
- `mapSamples: 40000` only for hero sections where visual fidelity is worth the cost
- `devicePixelRatio: Math.min(window.devicePixelRatio, 2)`
- pause `requestAnimationFrame` when the canvas is off-screen
- also pause when `document.visibilityState !== 'visible'`
- destroy the globe on teardown

## Main Guidance

### 1. Tune `mapSamples` before anything else

In COBE, `mapSamples` is usually the largest visual-quality and performance lever.

Practical rule:

- lower it first when the globe feels expensive
- increase it only after the rest of the scene is already cheap

Recommended ranges:

- `8000`: mobile, previews, low-end devices, many globes on a page
- `12000-16000`: default range for most pages
- `40000`: large hero sections or isolated showcase moments

Do not jump to a higher value if you still have avoidable scene cost from markers, arcs, or unnecessary updates.

### 2. Cap `devicePixelRatio`

Very dense displays can multiply GPU work quickly.

Use:

```ts
devicePixelRatio: Math.min(window.devicePixelRatio, 2);
```

This usually preserves enough sharpness while preventing very high-DPI screens from scaling cost too far.

### 3. Pause animation when the canvas is not visible

This is the highest-value optimization for docs, landing pages, and long scrollers.

Use `IntersectionObserver` to start animation only when the canvas is in view.

Why it matters:

- stops hidden globes from using CPU and GPU time
- improves scroll smoothness when multiple demos exist on one page
- reduces wasted battery on laptops and mobile devices

### 4. Pause animation when the tab is hidden

Off-screen pause is not enough by itself.

Also listen for `document.visibilityState` and stop animation when the tab becomes hidden. This avoids background animation churn even if the element would otherwise still count as intersecting.

### 5. Use dynamic imports when the globe is optional

If the globe lives in a tab, dialog, preview panel, or below-the-fold section, defer the library too:

```ts
const createGlobe = (await import('cobe')).default;
```

This reduces initial JavaScript for users who never open that part of the interface.

### 6. Render only the resolution you need

Canvas resolution should come from the actual rendered size, not a larger guessed size.

Typical pattern:

```ts
const dpr = Math.min(window.devicePixelRatio, 2);
const width = Math.round(canvas.clientWidth * dpr);
const height = Math.round(canvas.clientHeight * dpr);
```

Important note:

- recompute this on real resize events
- do not re-measure every frame if the canvas size is stable

### 7. Keep `globe.update()` focused

Call `globe.update()` only for values that are actually changing.

Common pattern:

- `phi` changes every frame
- markers, arcs, and scene config often do not

Avoid rebuilding markers/arcs arrays every animation tick unless the underlying scene data changed. Stable config means less per-frame work and less garbage creation.

### 8. Clean up aggressively

Always clean up:

- `cancelAnimationFrame(frame)`
- `observer.disconnect()`
- `globe.destroy()`

Use `globe.destroy()` when:

- the component unmounts
- the globe is being recreated with a new scene
- you intentionally tear down hidden previews instead of only pausing them

## Practical Priority Order

When a globe feels slow, optimize in this order:

1. Pause hidden animation.
2. Cap `devicePixelRatio`.
3. Lower `mapSamples`.
4. Reduce markers, arcs, or other scene detail.
5. Stop rebuilding config objects every frame.
6. Defer loading with dynamic import if the globe is optional.

## Copyable Pattern

The most reusable pattern is:

- lazy initialize the globe
- start `requestAnimationFrame` only when visible
- stop it when off-screen or tab-hidden
- destroy everything on teardown

The live route `/performance` includes a concise copyable code example for this.

## Source References

Primary reference files in this repo:

- `src/routes/performance/+page.svelte`
- `src/lib/components/usage/performance.svelte`
- `src/lib/components/usage/code.ts`

Related examples that already apply some of these ideas:

- `src/lib/components/usage/base.svelte`
- `src/lib/components/usage/css-anchor.svelte`
- `src/lib/components/example/flight.svelte`
- `src/lib/components/example/sticker.svelte`

## Guidance For AI Assistants

When helping with this project:

- prefer lowering scene cost before recommending higher visual fidelity
- treat `mapSamples` as the first major tuning knob
- keep docs examples simpler than the live site when teaching beginners
- recommend visibility-aware animation for pages that contain multiple globes
- avoid presenting performance guidance as a hard guarantee; frame it as practical COBE usage advice
