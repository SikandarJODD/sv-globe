# Polaroid Globe Example

Use this when you want richer visual callouts like photos, cards, or place previews attached to markers.

## What It Demonstrates

- marker-linked image cards
- HTML overlays with captions
- globe plus content composition

## Simple Example

```svelte
<script lang="ts">
	import createGlobe from 'cobe';
	import type { Globe } from 'cobe';
	import { onMount } from 'svelte';

	const cards = [
		{ id: 'sf', location: [37.78, -122.44] as [number, number], image: '/img/sf.jpg', caption: 'San Francisco' },
		{ id: 'nyc', location: [40.71, -74.01] as [number, number], image: '/img/nyc.jpg', caption: 'New York' },
		{ id: 'tokyo', location: [35.68, 139.65] as [number, number], image: '/img/tokyo.jpg', caption: 'Tokyo' },
		{ id: 'sydney', location: [-33.87, 151.21] as [number, number], image: '/img/sydney.jpg', caption: 'Sydney' }
	];

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = null;
	let phi = 0;
	let frame = 0;

	function animate() {
		phi += 0.003;
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
			diffuse: 1.35,
			mapSamples: 13000,
			mapBrightness: 9,
			baseColor: [1, 1, 1],
			markerColor: [0.4, 0.6, 0.9],
			glowColor: [0.96, 0.95, 0.92],
			markers: cards.map(({ id, location }) => ({ id, location, size: 0.02 }))
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

	{#each cards as card (card.id)}
		<div
			class="polaroid"
			style={`position-anchor: --cobe-${card.id}; --marker-visible: var(--cobe-visible-${card.id}, 0);`}
		>
			<img src={card.image} alt={card.caption} />
			<span>{card.caption}</span>
		</div>
	{/each}
</div>
```

## Source References

- simple teaching source: `src/lib/components/example/code.ts` -> `exampleCode.polaroid`
- live preview component: `src/lib/components/example/polaroids.svelte`
