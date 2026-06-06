# Svelte Globe Examples

This file indexes the richer globe examples used by Svelte Globe.

Important:

- The live preview components may contain extra runtime optimizations.
- The Markdown examples below are intentionally simpler and easier to copy.
- Start from these docs if an AI assistant or developer wants code clarity first.

## Example Index

- `/examples/cdn.md` : network routes, nodes, and traffic labels
- `/examples/sticker.md` : marker-anchored emoji or HTML stickers
- `/examples/flight.md` : airport markers plus route arcs
- `/examples/satellites.md` : elevated markers with pulsing beacons
- `/examples/polaroids.md` : image cards attached to globe markers

## How To Use These Examples

1. Pick the example closest to your product need.
2. Copy the simple version from the Markdown file first.
3. Replace the demo locations with your own data.
4. Add dragging, lazy loading, or visibility optimizations only after the example works.

## Design Philosophy

Svelte Globe prefers examples that answer:

- How do I render a globe?
- How do I add markers?
- How do I attach HTML to markers?
- How do I draw arcs between places?
- How do I create a polished visual treatment without turning the integration into a large custom system?

## Source References

- Example metadata: `src/lib/components/example/example.ts`
- Example code strings: `src/lib/components/example/code.ts`
- Live preview components: `src/lib/components/example/*.svelte`
