<script lang="ts">
	import type { Globe } from 'cobe';
	import { onDestroy, onMount } from 'svelte';

	const size = 300;
	const palette = {
		baseColor: [0.98, 0.95, 0.9] as [number, number, number],
		markerColor: [0.86, 0.43, 0.14] as [number, number, number],
		arcColor: [0.97, 0.57, 0.2] as [number, number, number],
		glowColor: [0.99, 0.94, 0.87] as [number, number, number],
		dark: 0.08,
		mapBrightness: 7.4
	};

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = null;
	let observer: IntersectionObserver | null = null;
	let createGlobePromise: Promise<typeof import('cobe').default> | null = null;
	let isVisible = false;
	let phi = 0.2;
	let frame = 0;

	function animate() {
		if (!globe) {
			frame = 0;
			return;
		}

		phi += 0.004;
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
			width: size,
			height: size,
			phi,
			theta: 0.1,
			dark: palette.dark,
			diffuse: 1.1,
			mapSamples: 14000,
			mapBrightness: palette.mapBrightness,
			baseColor: palette.baseColor,
			markerColor: palette.markerColor,
			glowColor: palette.glowColor,
			markers: [
				{ location: [35.68, 139.65], size: 0.04, id: 'tokyo' },
				{ location: [37.78, -122.44], size: 0.04, id: 'san-francisco' }
			],
			arcs: [{ from: [35.68, 139.65], to: [37.78, -122.44], id: 'tokyo-sf' }],
			arcColor: palette.arcColor,
			arcWidth: 0.55,
			arcHeight: 0.5,
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

<div class="colors-demo">
	<div class="globe">
		<canvas bind:this={canvas} class="globe-canvas"></canvas>
	</div>

	<div class="palette-preview" aria-label="Warm globe palette preview">
		<div class="palette-chip">
			<span class="swatch base"></span>
			<span>Base</span>
		</div>
		<div class="palette-chip">
			<span class="swatch marker"></span>
			<span>Marker</span>
		</div>
		<div class="palette-chip">
			<span class="swatch arc"></span>
			<span>Arc</span>
		</div>
	</div>
</div>

<style>
	.colors-demo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

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

	.palette-preview {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}

	.palette-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		background: rgb(255 251 245 / 0.9);
		padding: 0.45rem 0.7rem;
		font-family: var(--font-figtree);
		font-size: 0.75rem;
		color: rgb(71 36 14 / 0.85);
		border-radius: 50px;
		border: 1px solid rgb(219 110 36 / 0.25);
	}
	.palette-chip:hover {
		background: rgb(255, 250, 242);
		border: 1px solid rgb(219 110 36 / 0.4);
	}

	.swatch {
		display: inline-block;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 999px;
	}

	.base {
		background: rgb(250 241 229);
	}

	.marker {
		background: rgb(219 110 36);
	}

	.arc {
		background: rgb(247 145 51);
	}
</style>
