# CDN Globe Example

Use this when you want to show regions, edge nodes, and network traffic between them.

This version is intentionally simpler than the live preview. It avoids lazy loading and advanced drag logic so the structure is easy to understand.

## What It Demonstrates

- multiple globe markers
- arcs between regions
- HTML labels attached to markers
- HTML labels attached to arc anchors

## Simple Example

```svelte
<script lang="ts">
	import createGlobe from 'cobe';
	import type { Globe } from 'cobe';
	import { onMount } from 'svelte';

	const nodes = [
		{ id: 'iad', label: 'iad1', location: [38.95, -77.45] as [number, number] },
		{ id: 'sfo', label: 'sfo1', location: [37.62, -122.38] as [number, number] },
		{ id: 'cdg', label: 'cdg1', location: [49.01, 2.55] as [number, number] },
		{ id: 'hnd', label: 'hnd1', location: [35.55, 139.78] as [number, number] }
	];

	const routes = [
		{
			id: 'arc-1',
			from: [38.95, -77.45] as [number, number],
			to: [49.01, 2.55] as [number, number],
			traffic: '2.4 TB/s'
		},
		{
			id: 'arc-2',
			from: [37.62, -122.38] as [number, number],
			to: [35.55, 139.78] as [number, number],
			traffic: '1.8 TB/s'
		}
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
			mapSamples: 14000,
			mapBrightness: 10,
			baseColor: [1, 1, 1],
			markerColor: [0, 0, 0],
			glowColor: [0.95, 0.95, 0.95],
			markers: nodes.map(({ id, location }) => ({ id, location, size: 0.012 })),
			arcs: routes.map(({ id, from, to }) => ({ id, from, to })),
			arcColor: [0, 0, 0],
			arcWidth: 0.45,
			arcHeight: 0.16
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

	{#each nodes as node (node.id)}
		<div
			class="node-label"
			style={`position-anchor: --cobe-${node.id}; --marker-visible: var(--cobe-visible-${node.id}, 0);`}
		>
			{node.label}
		</div>
	{/each}

	{#each routes as route (route.id)}
		<div
			class="route-label"
			style={`position-anchor: --cobe-arc-${route.id}; --arc-visible: var(--cobe-visible-arc-${route.id}, 0);`}
		>
			{route.traffic}
		</div>
	{/each}
</div>
```

## Source References

- simple teaching source: `src/lib/components/example/code.ts` -> `exampleCode.cdn`
- live preview component: `src/lib/components/example/cdn.svelte`
