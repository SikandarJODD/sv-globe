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

	const markers = [
		{ id: 'sf', location: [37.78, -122.44] as [number, number], label: 'San Francisco' },
		{ id: 'nyc', location: [40.71, -74.01] as [number, number], label: 'New York' }
	];

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
			markers: markers.map(({ id, location }) => ({ id, location, size: 0.03 })),
			arcs: [{ from: [37.78, -122.44], to: [40.71, -74.01] }],
			arcColor: [0.3, 0.5, 1],
			arcWidth: 0.5,
			arcHeight: 0.3
		});

		animate();
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

			stopAnimation();
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
	<canvas bind:this={canvas} class="globe-canvas"></canvas>
	{#each markers as marker (marker.id)}
		<div
			class="marker-label"
			style={`position-anchor: --cobe-${marker.id}; --marker-visible: var(--cobe-visible-${marker.id}, 0);`}
		>
			{marker.label}
		</div>
	{/each}
</div>

<style>
	.globe {
		position: relative;
		width: 300px;
		height: 300px;
	}

	.globe-canvas {
		/* display: block; */
		width: 100%;
		height: 100%;
	}

	.marker-label {
		position: absolute;
		bottom: anchor(top);
		left: anchor(center);
		margin-bottom: 8px;
		padding: 0.25rem 0.5rem;
		background: var(--color-ink);
		color: #fff;
		font-size: 0.75rem;
		border-radius: 4px;
		white-space: nowrap;
		pointer-events: none;
		opacity: var(--marker-visible, 0);
		transition:
			opacity 0.3s,
			filter 0.3s,
			translate 0.3s;
		filter: blur(calc((1 - var(--marker-visible, 0)) * 8px));
		translate: -50% calc((1 - var(--marker-visible, 0)) * 6px);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.globe {
			width: 320px;
			height: 320px;
		}
	}
	
</style>
