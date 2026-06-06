# Satellite Globe Example

Use this when you want elevated markers or pulsing beacon-like overlays.

## What It Demonstrates

- elevated marker feel
- repeated overlay pattern
- animated satellite/beacon treatment

## Simple Example

```svelte
<script lang="ts">
	import createGlobe from 'cobe';
	import type { Globe } from 'cobe';
	import { onMount } from 'svelte';

	const markers = [
		{ id: 'sat-1', location: [45, -120] as [number, number] },
		{ id: 'sat-2', location: [30, 45] as [number, number] },
		{ id: 'sat-3', location: [-15, 100] as [number, number] },
		{ id: 'sat-4', location: [60, -30] as [number, number] }
	];

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = null;
	let phi = 0;
	let frame = 0;

	function animate() {
		phi += 0.0027;
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
			dark: 0.01,
			diffuse: 1.25,
			mapSamples: 14000,
			mapBrightness: 9,
			baseColor: [0.95, 0.95, 0.95],
			markerColor: [0.9, 0.9, 0.9],
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

	{#each markers as marker, index (marker.id)}
		<div
			class="satellite"
			style={`position-anchor: --cobe-${marker.id}; --marker-visible: var(--cobe-visible-${marker.id}, 0); --delay: ${index * 120}ms;`}
		>
			<div class="satellite-core"></div>
			<div class="satellite-wave"></div>
		</div>
	{/each}
</div>
```

## Source References

- simple teaching source: `src/lib/components/example/code.ts` -> `exampleCode.satellites`
- live preview component: `src/lib/components/example/satellites.svelte`
