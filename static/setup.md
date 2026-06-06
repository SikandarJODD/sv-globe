# Svelte Globe Setup Guide

Svelte Globe is a Svelte-first reference for adding a COBE globe to a website with as little setup as possible.

Website: https://sv-globe.vercel.app  
Repository: https://github.com/SikandarJODD/sv-globe

## Goal

Start with a minimal globe, confirm it renders correctly, then layer on markers, arcs, labels, and richer overlays.

## Install

```bash
pnpm i cobe
```

## Minimal Starter Example

This is the cleanest starting point for most users.

```svelte
<script lang="ts">
	import createGlobe from 'cobe';
	import type { Globe } from 'cobe';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = null;
	let phi = 0;
	let frame = 0;

	function animate() {
		phi += 0.005;
		globe?.update({ phi });
		frame = requestAnimationFrame(animate);
	}

	onMount(() => {
		if (!canvas) return;

		globe = createGlobe(canvas, {
			devicePixelRatio: Math.min(window.devicePixelRatio, 2),
			width: 300,
			height: 300,
			phi: 0,
			theta: 0.2,
			dark: 0,
			diffuse: 1.2,
			mapSamples: 13000,
			mapBrightness: 6,
			baseColor: [1, 1, 1],
			markerColor: [0.2, 0.4, 1],
			glowColor: [1, 1, 1],
			markers: [
				{ location: [37.78, -122.44], size: 0.03, id: 'sf' },
				{ location: [40.71, -74.01], size: 0.03, id: 'nyc' }
			],
			arcs: [{ from: [37.78, -122.44], to: [40.71, -74.01] }],
			arcColor: [0.3, 0.5, 1],
			arcWidth: 0.5,
			arcHeight: 0.3
		});

		animate();

		return () => {
			cancelAnimationFrame(frame);
			globe?.destroy();
		};
	});
</script>

<div class="globe">
	<canvas bind:this={canvas} class="globe-canvas"></canvas>
</div>

<style>
	.globe {
		width: 300px;
		height: 300px;
	}

	.globe-canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
```

## What To Customize First

Change these values first:

- `markers`: add locations you care about
- `arcs`: connect important routes
- `baseColor`, `markerColor`, `glowColor`: match your design
- `width` and `height`: fit your layout
- `phi` update speed in `animate()`: control auto-rotation feel

## Where To Go Next

- `/usage.md` for reusable globe patterns
- `/examples.md` for richer compositions
- `/examples/cdn.md` for network-style overlays
- `/examples/flight.md` for route arcs and labels

## Source References

- Minimal setup source: `src/lib/components/usage/code.ts`
- Setup page: `src/routes/setup/+page.svelte`
