# Sticker Globe Example

Use this when you want markers to render with playful emoji or small HTML badges.

## What It Demonstrates

- marker overlays
- HTML attached to globe points
- easy customization with text or emoji

## Simple Example

```svelte
<script lang="ts">
	import createGlobe from 'cobe';
	import type { Globe } from 'cobe';
	import { onMount } from 'svelte';

	const markers = [
		{ id: 'paris', location: [48.86, 2.35] as [number, number], sticker: '🥐' },
		{ id: 'tokyo', location: [35.68, 139.65] as [number, number], sticker: '🗼' },
		{ id: 'nyc', location: [40.71, -74.01] as [number, number], sticker: '🍎' },
		{ id: 'sydney', location: [-33.87, 151.21] as [number, number], sticker: '🐨' }
	];

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = null;
	let phi = 0;
	let frame = 0;

	function animate() {
		phi += 0.0035;
		globe?.update({ phi });
		frame = requestAnimationFrame(animate);
	}

	onMount(() => {
		if (!canvas) return;

		globe = createGlobe(canvas, {
			devicePixelRatio: Math.min(window.devicePixelRatio, 2),
			width: 320,
			height: 320,
			phi: 0,
			theta: 0.2,
			dark: 0,
			diffuse: 1.15,
			mapSamples: 16000,
			mapBrightness: 8,
			baseColor: [1, 1, 1],
			markerColor: [0.85, 0.35, 0.6],
			glowColor: [1, 1, 1],
			markers: markers.map(({ id, location }) => ({ id, location, size: 0.03 }))
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

	{#each markers as marker (marker.id)}
		<div
			class="sticker"
			style={`position-anchor: --cobe-${marker.id}; --marker-visible: var(--cobe-visible-${marker.id}, 0);`}
		>
			{marker.sticker}
		</div>
	{/each}
</div>
```

## Source References

- simple teaching source: `src/lib/components/example/code.ts` -> `exampleCode.sticker`
- live preview component: `src/lib/components/example/sticker.svelte`
