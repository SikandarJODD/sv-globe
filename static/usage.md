# Svelte Globe Usage Patterns

Use this file after `/setup.md` when you already have a globe working and want one specific behavior.

## Recommended Order

1. `/setup.md`
2. one pattern from `/usage.md`
3. `/performance.md` if the page gets heavy
4. `/examples.md` for richer scenes

## Base Setup

Use when you want the cleanest starting point with rotation, markers, and a simple arc.

Reference:

- `src/lib/components/usage/code.ts` -> `usageCode.base`

## Draggable Globe

Use when users should rotate the globe directly.

Reference:

- `src/lib/components/usage/code.ts` -> `usageCode.draggable`

## Globe Colors

Use when you only want to change the globe mood with scene colors and brightness.

Reference:

- `src/lib/components/usage/code.ts` -> `usageCode.colors`

## CSS Anchor Labels

Use when HTML labels should follow globe markers.

Reference:

- `src/lib/components/usage/code.ts` -> `usageCode.cssAnchor`

## Focus Location

Use when the globe should rotate toward one selected place.

Reference:

- `src/lib/components/usage/code.ts` -> `usageCode.focusLocation`

## Dynamic Arc Tour

Use when you want multiple routes, destination focus, and richer travel-style interaction.

Reference:

- `src/lib/components/usage/code.ts` -> `usageCode.arcTour`

## Performance Pattern

Use when the page contains multiple globes or heavy previews.

Reference:

- `src/lib/components/usage/code.ts` -> `usageCode.performance`

## Next Reads

- `/performance.md`
- `/examples.md`
- `/examples/flight.md`
- `/examples/sticker.md`
- `/examples/polaroids.md`
