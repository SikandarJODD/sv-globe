<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { Globe } from 'cobe';

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = null;
	let observer: IntersectionObserver | null = null;
	let createGlobePromise: Promise<typeof import('cobe').default> | null = null;
	let isVisible = false;

	function destroyGlobe() {
		globe?.destroy();
		globe = null;
	}

	async function getCreateGlobe() {
		createGlobePromise ??= import('cobe').then((module) => module.default);
		return createGlobePromise;
	}

	async function startGlobe() {
		if (!canvas || globe) return;

		const createGlobe = await getCreateGlobe();

		if (!canvas || globe || !isVisible) return;

		globe = createGlobe(canvas, {
			devicePixelRatio: Math.min(window.devicePixelRatio, 2),
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
	}

	onMount(() => {
		if (!canvas) return;

		observer = new IntersectionObserver(([entry]) => {
			if (!entry) return;
			isVisible = entry.isIntersecting;
			if (isVisible) {
				void startGlobe();
				return;
			}
		}, { threshold: 0.1 });

		observer.observe(canvas);
	});

	onDestroy(() => {
		observer?.disconnect();
		observer = null;
		isVisible = false;
		destroyGlobe();
		canvas = null;
	});
</script>

<div class="globe">
	<canvas class="globe-canvas" bind:this={canvas}></canvas>
</div>

<style>
	.globe {
		width: 200px;
		height: 200px;
	}
	.globe-canvas {
		width: 100%;
		height: 100%;
	}
</style>
