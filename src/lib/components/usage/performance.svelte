<script lang="ts">
	import createGlobe from 'cobe';
	import { type Globe } from 'cobe';
	import { onMount } from 'svelte';

	const size = 300;

	let canvas: HTMLCanvasElement | null = $state(null);
	let globe: Globe | null = $state(null);
	let observer: IntersectionObserver | null = $state(null);
	let frame = $state(0);
	let phi = $state(0);

	function createGlobeInstance() {
		if (!canvas || globe) return;

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
			arcs: [{ from: [37.78, -122.44], to: [40.71, -74.01] }],
			arcColor: [0.3, 0.5, 1],
			arcWidth: 0.5,
			arcHeight: 0.3
		});
	}

	function animate() {
		if (!globe) {
			frame = 0;
			return;
		}

		phi += 0.005;
		globe?.update({ phi });
		frame = requestAnimationFrame(animate);
	}

	function startAnimation() {
		createGlobeInstance();
		if (frame || !globe) return;
		animate();
	}

	function stopAnimation({ destroy = false } = {}) {
		if (frame) {
			cancelAnimationFrame(frame);
			frame = 0;
		}

		if (destroy) {
			globe?.destroy();
			globe = null;
			// console.log('Destroying globe instance to free up WebGL resources.');
			// console.time('Destroy globe');
			// console.timeEnd('Destroy globe');
			// console.log('Globe instance destroyed:', globe);
		}
	}

	onMount(() => {
		if (!canvas) return;

		observer = new IntersectionObserver(
			([entry]) => {
				if (!entry) return;

				if (entry.isIntersecting) {
					startAnimation();
					return;
				}

				// Stop the RAF loop and release the WebGL resources when off-screen.
				stopAnimation({ destroy: true });
			},
			{
				threshold: 0.1,
                // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#rootmargin
                // i have added -200px so you can test the unmounting behavior without fully scrolling the globe out of view. 
                // Adjust as needed for your layout.
                // rootMargin: '-200px 0px -50px 0px' 
			}
		);

		observer.observe(canvas);
		startAnimation();

		return () => {
			observer?.disconnect();
			observer = null;
			stopAnimation({ destroy: true });
		};
	});
</script>

<div class="globe">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.globe {
		width: 300px;
		height: 300px;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
		border: 1px solid #d4d4d8;
	}
</style>
