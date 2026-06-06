# Flight Globe Example

Use this when you want to visualize travel routes, airport connections, or cross-region movement.

## What It Demonstrates

- multiple markers
- arcs between airports
- HTML labels for airports
- HTML labels for route anchors

## Simple Example

```svelte
<script lang="ts">
	import createGlobe from 'cobe';
	import type { Globe } from 'cobe';
	import { onMount } from 'svelte';

	const airports = [
		{ id: 'sfo', label: 'SFO', location: [37.62, -122.38] as [number, number] },
		{ id: 'nyc', label: 'NYC', location: [40.71, -74.01] as [number, number] },
		{ id: 'ldn', label: 'LON', location: [51.5, -0.12] as [number, number] },
		{ id: 'tok', label: 'TYO', location: [35.68, 139.65] as [number, number] }
	];

	const routes = [
		{ id: 'route-1', from: [37.62, -122.38] as [number, number], to: [40.71, -74.01] as [number, number], label: 'SFO-NYC' },
		{ id: 'route-2', from: [40.71, -74.01] as [number, number], to: [51.5, -0.12] as [number, number], label: 'NYC-LON' },
		{ id: 'route-3', from: [51.5, -0.12] as [number, number], to: [35.68, 139.65] as [number, number], label: 'LON-TYO' }
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
			diffuse: 1.3,
			mapSamples: 15000,
			mapBrightness: 8,
			baseColor: [1, 1, 1],
			markerColor: [0.2, 0.4, 1],
			glowColor: [0.88, 0.93, 1],
			markers: airports.map(({ id, location }) => ({ id, location, size: 0.02 })),
			arcs: routes.map(({ id, from, to }) => ({ id, from, to })),
			arcColor: [0.2, 0.4, 1],
			arcWidth: 0.55,
			arcHeight: 0.18
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

	{#each airports as airport (airport.id)}
		<div
			class="airport-label"
			style={`position-anchor: --cobe-${airport.id}; --marker-visible: var(--cobe-visible-${airport.id}, 0);`}
		>
			{airport.label}
		</div>
	{/each}

	{#each routes as route (route.id)}
		<div
			class="route-label"
			style={`position-anchor: --cobe-arc-${route.id}; --arc-visible: var(--cobe-visible-arc-${route.id}, 0);`}
		>
			{route.label}
		</div>
	{/each}
</div>
```

## Source References

- simple teaching source: `src/lib/components/example/code.ts` -> `exampleCode.flight`
- live preview component: `src/lib/components/example/flight.svelte`
