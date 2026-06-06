<script lang="ts">
	import type { Globe } from 'cobe';
	import { onDestroy, onMount } from 'svelte';

	const size = 300;

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = null;
	let observer: IntersectionObserver | null = null;
	let createGlobePromise: Promise<typeof import('cobe').default> | null = null;
	let isVisible = false;
	let frame = 0;
	let phi = 0;

	async function getCreateGlobe() {
		createGlobePromise ??= import('cobe').then((module) => module.default);
		return createGlobePromise;
	}

	async function createGlobeInstance() {
		if (!canvas || globe) return;

		const createGlobe = await getCreateGlobe();

		if (!canvas || globe || !isVisible) return;

		globe = createGlobe(canvas, {
			// Cap DPR so high-density screens do not overload the GPU.
			devicePixelRatio: Math.min(window.devicePixelRatio, 2),
			width: size,
			height: size,
			phi,
			theta: 0.2,
			dark: 0,
			diffuse: 1.2,
			// mapSamples is the biggest performance lever:
			// 8k for mobile, 12k-16k for general use, 40k for hero sections.
			mapSamples: 12000,
			mapBrightness: 6,
			baseColor: [1, 1, 1],
			markerColor: [0.2, 0.4, 1],
			glowColor: [1, 1, 1],
			markers: [
				{ location: [37.78, -122.44], size: 0.03, id: 'sf' },
				{ location: [40.71, -74.01], size: 0.03, id: 'nyc' }
			],
			markerElevation:0
		});
	}

	function animate() {
		if (!globe) {
			frame = 0;
			return;
		}

		phi += 0.005;
		globe.update({ phi });
		frame = requestAnimationFrame(animate);
	}

	function startAnimation() {
		if (frame) return;

		void createGlobeInstance().then(() => {
			if (frame || !globe) return;
			animate();
		});
	}

	function stopAnimation({ destroy = false } = {}) {
		if (frame) {
			cancelAnimationFrame(frame);
			frame = 0;
		}

		if (destroy) {
			globe?.destroy();
			globe = null;
		}
	}

	onMount(() => {
		if (!canvas) return;

		observer = new IntersectionObserver(
			([entry]) => {
				if (!entry) return;
				isVisible = entry.isIntersecting;

				if (isVisible) {
					startAnimation();
					return;
				}

				stopAnimation();
			},
			{
				threshold: 0.1
				// https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#rootmargin
				// i have added -200px so you can test the unmounting behavior without fully scrolling the globe out of view.
				// Adjust as needed for your layout.
				// rootMargin: '-200px 0px -50px 0px'
			}
		);

		observer.observe(canvas);
		startAnimation();
	});

	onDestroy(() => {
		observer?.disconnect();
		observer = null;
		isVisible = false;
		stopAnimation({ destroy: true });
		canvas = null;
	});
</script>

<div class="globe">
	<canvas class="globe-canvas" bind:this={canvas}></canvas>
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
