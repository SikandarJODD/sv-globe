<script lang="ts">
	import type { Globe } from 'cobe';
	import { onDestroy, onMount } from 'svelte';

	type LocationItem = {
		id: string;
		label: string;
		location: [number, number];
	};

	const size = 300;
	const locations: LocationItem[] = [
		{ id: 'nyc', label: 'New York', location: [40.71, -74.01] },
		{ id: 'ldn', label: 'London', location: [51.5, -0.12] },
		{ id: 'tok', label: 'Tokyo', location: [35.68, 139.65] },
		{ id: 'syd', label: 'Sydney', location: [-33.87, 151.21] },
		{ id: 'del', label: 'Delhi', location: [28.61, 77.21] }
	];

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = null;
	let observer: IntersectionObserver | null = null;
	let createGlobePromise: Promise<typeof import('cobe').default> | null = null;
	let isVisible = false;
	let frame = 0;
	let phi = 0;
	let theta = 0.2;
	let activeLocationId = $state('tok');

	function locationToAngles(lat: number, long: number) {
		return [Math.PI - ((long * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];
	}

	function normalizeDelta(delta: number) {
		return Math.atan2(Math.sin(delta), Math.cos(delta));
	}

	function getActiveLocation() {
		return locations.find((location) => location.id === activeLocationId) ?? locations[0];
	}

	function focusLocation(id: string) {
		activeLocationId = id;
	}

	function getMarkers() {
		return locations.map((location) => ({
			id: location.id,
			location: location.location,
			size: location.id === activeLocationId ? 0.055 : 0.035
		}));
	}

	function animate() {
		if (!globe) {
			frame = 0;
			return;
		}

		const activeLocation = getActiveLocation();
		const [targetPhi, targetTheta] = locationToAngles(...activeLocation.location);
		const distPhi = normalizeDelta(targetPhi - phi);
		const distTheta = targetTheta - theta;

		phi += distPhi * 0.08;
		theta += distTheta * 0.08;

		globe.update({
			phi,
			theta,
			markers: getMarkers()
		});

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
			theta,
			dark: 0,
			diffuse: 1.2,
			mapSamples: 13000,
			mapBrightness: 6,
			baseColor: [1, 1, 1],
			markerColor: [0.2, 0.4, 1],
			glowColor: [1, 1, 1],
			markers: getMarkers(),
			markerElevation:0
		});

		animate();
	}

	onMount(() => {
		if (!canvas) return;

		const [initialPhi, initialTheta] = locationToAngles(...getActiveLocation().location);
		phi = initialPhi;
		theta = initialTheta;

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

<div class="focus-demo">
	<div class="globe">
		<canvas class="globe-canvas" bind:this={canvas}></canvas>
	</div>

	<div class="location-list" aria-label="Focus globe on a location">
		{#each locations as location (location.id)}
			<button
				type="button"
				class={`rounded-full border px-3 py-2 font-figtree text-xs leading-none font-medium transition-all duration-200 ${
					location.id === activeLocationId
						? 'border-ink/20 bg-ink text-background'
						: 'border-ink/12 bg-background/95 text-ink/70 hover:-translate-y-px hover:border-ink/20 hover:text-ink'
				}`}
				onclick={() => focusLocation(location.id)}
			>
				{location.label}
			</button>
		{/each}
	</div>
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

	.location-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		max-width: 320px;
	}

</style>
