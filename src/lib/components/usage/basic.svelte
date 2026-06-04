<script lang="ts">
	import createGlobe from 'cobe';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement | null = $state(null);

	onMount(() => {
		if (!canvas) return;
		createGlobe(canvas, {
			devicePixelRatio: 2,
			width: 200,
			height: 200,
			phi: 0,
			theta: 0.2,
			dark: 0,
			diffuse: 1.2,
			mapSamples: 16000,
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
	});
</script>

<div class="container">
	<canvas bind:this={canvas}></canvas>
</div>
