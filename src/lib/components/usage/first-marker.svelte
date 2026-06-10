<script lang="ts">
	import type { Globe } from 'cobe';
	import { onDestroy, onMount } from 'svelte';

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = null;
	let observer: IntersectionObserver | null = null;
	let createGlobePromise: Promise<typeof import('cobe').default> | null = null;
	let isVisible = false;
	let phi = 0;
	let frame = 0;

	function animate() {
		if (!globe) {
			frame = 0;
			return;
		}

		phi += 0.005;
		globe.update({ phi });
		frame = requestAnimationFrame(animate);
	}

	function stopAnimation() {
		if (!frame) return;
		cancelAnimationFrame(frame);
		frame = 0;
	}

	function destroyGlobe() {
		stopAnimation();
		globe?.destroy();
		globe = null;
	}

	async function getCreateGlobe() {
		createGlobePromise ??= import('cobe').then((module) => module.default);
		return createGlobePromise;
	}

	async function startGlobe() {
		if (!canvas) return;

		if (globe) {
			if (!frame) animate();
			return;
		}

		const createGlobe = await getCreateGlobe();

		if (!canvas || globe || !isVisible) return;

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
			markers: [{ id: 'india', location: [28.61, 77.21], size: 0.05 }],
			markerElevation: 0
		});

		animate();
	}

	onMount(() => {
		if (!canvas) return;

		observer = new IntersectionObserver(
			([entry]) => {
				if (!entry) return;
				isVisible = entry.isIntersecting;
				if (isVisible) {
					void startGlobe();
					return;
				}

				stopAnimation();
			},
			{ threshold: 0.1 }
		);

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
	<canvas bind:this={canvas} class="globe-canvas"></canvas>
</div>

<style>
	.globe {
		position: relative;
		width: 300px;
		height: 300px;
	}

	.globe-canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
