# Svelte Globe Usage Patterns

This document explains the main reusable patterns in Svelte Globe without the extra runtime optimizations used in some live previews.

Use this file when you already have a globe rendering and want to add one specific behavior.

## Recommended Order

1. Start from `/setup.md`
2. Add one usage pattern at a time
3. Move to `/examples.md` when you want a richer product-like composition

## Base Setup

Use when you want a clean rotating globe with markers and one arc.

Reference source:

- `src/lib/components/usage/code.ts` -> `usageCode.base`

## Draggable Globe

Use when the user should rotate the globe directly.

Simple idea:

- keep a base `phi`
- track pointer movement
- update `phi` and `theta`
- call `globe.update(...)` inside `requestAnimationFrame`

Reference source:

- `src/lib/components/usage/code.ts` -> `usageCode.draggable`

## CSS Anchor Labels

Use when you want HTML labels to follow markers.

Simple idea:

- give each marker an `id`
- let COBE expose anchor variables such as `--cobe-sf`
- place HTML labels with `position-anchor`

Reference source:

- `src/lib/components/usage/code.ts` -> `usageCode.cssAnchor`

## Focus Location

Use when the globe should rotate toward one selected city or country.

Simple idea:

- store a list of known locations
- convert latitude/longitude to `phi` and `theta`
- ease current angles toward target angles

Reference source:

- `src/lib/components/usage/code.ts` -> `usageCode.focusLocation`

## Performance Pattern

Use when you have many heavy previews on one page.

Important note:

The live site may use optimizations like `IntersectionObserver` or lazy setup to reduce client-side work.  
For learning and copying, start with the simpler examples in `/setup.md` and `/examples.md`, then add performance optimizations later only if you need them.

Reference source:

- `src/lib/components/usage/code.ts` -> `usageCode.performance`

## Richer Overlay Pattern

Use when you want content cards, photos, or custom UI attached to markers.

Reference source:

- `src/routes/usage/usage.ts`
- `src/lib/components/example/code.ts` -> `exampleCode.polaroid`

## Best Next Reads

- `/examples.md`
- `/examples/sticker.md`
- `/examples/cdn.md`
- `/examples/flight.md`
- `/examples/satellites.md`
- `/examples/polaroids.md`
