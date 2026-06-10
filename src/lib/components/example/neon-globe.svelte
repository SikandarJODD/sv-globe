<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { Globe } from 'cobe';

	import * as Select from '$lib/components/ui/select';
	import { mode } from 'mode-watcher';
	import { watch } from 'runed';

	type Region = {
		id: string;
		label: string;
		code: string;
		location: [number, number];
	};

	const regions: Region[] = [
		{
			id: 'us-east-1',
			label: 'US East 1 (N. Virginia)',
			code: 'us-east-1',
			location: [38.95, -77.45]
		},
		{
			id: 'us-east-2',
			label: 'US East 2 (Ohio)',
			code: 'us-east-2',
			location: [39.96, -82.99]
		},
		{
			id: 'us-west-2',
			label: 'US West 2 (Oregon)',
			code: 'us-west-2',
			location: [45.52, -122.68]
		},
		{
			id: 'ap-southeast-1',
			label: 'Asia Pacific 1 (Singapore)',
			code: 'ap-southeast-1',
			location: [1.29, 103.85]
		},
		{
			id: 'ap-southeast-2',
			label: 'Asia Pacific 2 (Sydney)',
			code: 'ap-southeast-2',
			location: [-33.87, 151.21]
		},
		{
			id: 'eu-central-1',
			label: 'Europe Central 1 (Frankfurt)',
			code: 'eu-central-1',
			location: [50.11, 8.68]
		},
		{
			id: 'eu-west-2',
			label: 'Europe West 2 (London)',
			code: 'eu-west-2',
			location: [51.51, -0.13]
		},
		{
			id: 'sa-east-1',
			label: 'South America East 1 (Sao Paulo)',
			code: 'sa-east-1',
			location: [-23.55, -46.63]
		}
	];

	const activeMarkerColor = [0.35, 0.98, 0.86] as [number, number, number];
	const idleMarkerColor = [0.18, 0.56, 0.53] as [number, number, number];

	let selectedRegionId = $state('eu-west-2');
	const selectedRegion = $derived(
		regions.find((region) => region.id === selectedRegionId) ?? regions[0]
	);

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = $state(null);
	let observer: IntersectionObserver | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let createGlobePromise: Promise<typeof import('cobe').default> | null = null;
	let frame = 0;
	let isVisible = false;
	let renderedSize = 0;
	let renderedDevicePixelRatio = 0;
	let currentPhi = 0;
	let currentTheta = 0;

	function locationToAngles(lat: number, long: number) {
		return [Math.PI - ((long * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180] as const;
	}

	function normalizeDelta(delta: number) {
		return Math.atan2(Math.sin(delta), Math.cos(delta));
	}

	function getMarkers(activeRegionId: string) {
		return regions.map((region) => ({
			id: region.id,
			location: region.location,
			size: region.id === activeRegionId ? 0.038 : 0.032,
			color: region.id === activeRegionId ? activeMarkerColor : idleMarkerColor
		}));
	}

	function getCanvasMetrics() {
		if (!canvas) return null;

		const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
		const size = Math.max(320, Math.round(canvas.getBoundingClientRect().width * devicePixelRatio));

		return { devicePixelRatio, size };
	}

	function syncCanvasSize() {
		const metrics = getCanvasMetrics();
		if (!metrics) return null;

		if (renderedSize === metrics.size && renderedDevicePixelRatio === metrics.devicePixelRatio) {
			return metrics;
		}

		renderedSize = metrics.size;
		renderedDevicePixelRatio = metrics.devicePixelRatio;

		globe?.update({
			devicePixelRatio: renderedDevicePixelRatio,
			width: renderedSize,
			height: renderedSize
		});

		return metrics;
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

	function animate() {
		if (!globe) {
			frame = 0;
			return;
		}

		const time = performance.now();
		const [focusedPhi, focusedTheta] = locationToAngles(...selectedRegion.location);
		const targetPhi = focusedPhi + Math.sin(time * 0.00028) * 0.08;
		const targetTheta = focusedTheta + Math.sin(time * 0.0002) * 0.035;

		currentPhi += normalizeDelta(targetPhi - currentPhi) * 0.09;
		currentTheta += (targetTheta - currentTheta) * 0.08;

		globe.update({
			phi: currentPhi,
			theta: currentTheta,
			markers: getMarkers(selectedRegion.id)
		});

		frame = requestAnimationFrame(animate);
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

		const metrics = syncCanvasSize();
		if (!metrics) return;

		const [initialPhi, initialTheta] = locationToAngles(...selectedRegion.location);
		currentPhi = initialPhi;
		currentTheta = initialTheta;

		const createGlobe = await getCreateGlobe();
		if (!canvas || globe || !isVisible) return;

		globe = createGlobe(canvas, {
			devicePixelRatio: metrics.devicePixelRatio,
			width: metrics.size,
			height: metrics.size,
			phi: currentPhi,
			theta: currentTheta,
			dark: 0,
			diffuse: 1,
			mapSamples: 15000,
			mapBrightness: 2,
			mapBaseBrightness: 0,
			baseColor: [0.9, 0.93, 0.95],
			markerColor: idleMarkerColor,
			// glowColor: [0.04, 0.25, 0.2],
			glowColor: [0.52, 0.92, 0.82],
			// markers: getMarkers(selectedRegion.id),
			markerElevation: 0.0
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
			{ threshold: 0.18 }
		);

		resizeObserver = new ResizeObserver(() => {
			syncCanvasSize();
		});

		observer.observe(canvas);
		resizeObserver.observe(canvas);
	});

	onDestroy(() => {
		observer?.disconnect();
		resizeObserver?.disconnect();
		observer = null;
		resizeObserver = null;
		isVisible = false;
		destroyGlobe();
		canvas = null;
	});
	watch(
		() => mode.current,
		() => {
			if (mode.current === 'dark') {
				globe?.update({
					dark: 1,
					diffuse: 1,
					mapBrightness: 2,
					mapBaseBrightness: 0,
					baseColor: [0.9, 0.93, 0.95],
					markerColor: idleMarkerColor,
					glowColor: [0.04, 0.25, 0.2]
				});
			} else {
				globe?.update({
					dark: 0,
					diffuse: 1,
					mapBrightness: 2,
					mapBaseBrightness: 0,
					baseColor: [0.9, 0.93, 0.95],
					markerColor: idleMarkerColor,
					glowColor: [0.52, 0.92, 0.82]
				});
			}
		}
	);
</script>

<div class="neon-demo">
	<div class="w-60">
		<Select.Root type="single" bind:value={selectedRegionId}>
			<Select.Trigger class="neon-trigger w-full min-w-0 justify-between">
				<span class="truncate">{selectedRegion.label}</span>
			</Select.Trigger>
			<Select.Content interactOutsideBehavior='ignore' class="neon-content border border-[#39f7cb]/20">
				{#each regions as region (region.id)}
					<Select.Item value={region.id} label={region.label} class="neon-item ">
						{region.label}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<div class="neon-stage">
		<div class="neon-globe">
			<canvas bind:this={canvas} class="neon-canvas" class:is-ready={!!globe}></canvas>

			<div
				class="neon-card"
				style={`position-anchor: --cobe-${selectedRegion.id}; --marker-visible: var(--cobe-visible-${selectedRegion.id}, 0);`}
			>
				<div class="neon-card-kicker">
					<span class="neon-card-dot"></span>
					AWS Region
				</div>
				<p class="neon-card-title">{selectedRegion.label}</p>
				<p class="neon-card-code">{selectedRegion.code}</p>
			</div>
		</div>
	</div>
</div>

<style>
	.neon-stage {
		display: flex;
		justify-content: end;
	}

	.neon-globe {
		position: relative;
		width: min(100%, 26rem);
		aspect-ratio: 1;
	}

	.neon-canvas {
		width: 100%;
		height: 100%;
		opacity: 0;
	}

	.neon-canvas.is-ready {
		opacity: 1;
	}

	.neon-card {
		position: absolute;
		top: anchor(bottom);
		left: anchor(center);
		translate: -50% 20px;
		width: min(16rem, calc(100vw - 5rem));
		padding: 1rem;
		border: 1px solid rgba(10, 228, 156, 0.94);
		background:
			linear-gradient(180deg, rgb(255 255 255 / 0.96), rgb(240 253 250 / 0.94)),
			rgb(255 255 255 / 0.95);
		/* box-shadow:
			0 0 0 1px rgb(16 185 129 / 0.08),
			0 0 24px rgb(45 212 191 / 0.12),
			0 18px 36px rgb(15 23 42 / 0.1); */
		opacity: var(--marker-visible, 0);
		filter: blur(calc((1 - var(--marker-visible, 0)) * 8px));
		transition:
			opacity 0.5s ease,
			filter 0.5s ease,
			translate 0.5s ease;
		pointer-events: none;
	}

	.neon-card-kicker {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		margin-bottom: 0.55rem;
		font-family: var(--font-figtree), sans-serif;
		font-size: 12px;
		font-weight: 600;
		color: rgb(71 85 105 / 0.88);
	}

	.neon-card-dot {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 9999px;
		background: #39f7cb;
		box-shadow: 0 0 12px rgb(57 247 203 / 0.8);
	}

	.neon-card-title {
		margin: 0;
		font-family: var(--font-figtree), sans-serif;
		font-size: 16px;
		font-weight: 600;
		line-height: 1.2;
		color: rgb(15 23 42);
	}

	.neon-card-code {
		margin: 0.55rem 0 0;
		font-family: var(--font-mono), monospace;
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgb(13 148 136 / 0.9);
	}

	:global(.dark) .neon-card {
		border-color: rgb(57 247 203 / 0.5);
		background: linear-gradient(180deg, rgb(5 12 10 / 0.96), rgb(3 8 7 / 0.92)), rgb(3 8 7 / 0.92);
		box-shadow:
			0 0 0 1px rgb(57 247 203 / 0.08),
			0 0 24px rgb(57 247 203 / 0.16),
			0 18px 36px rgb(0 0 0 / 0.28);
	}

	:global(.dark) .neon-card-kicker {
		color: rgb(208 220 216 / 0.76);
	}

	:global(.dark) .neon-card-title {
		color: white;
	}

	:global(.dark) .neon-card-code {
		color: rgb(136 245 221 / 0.78);
	}

	@media (min-width: 640px) {
		.neon-demo {
			padding: 1.25rem 1.25rem 1.4rem;
		}
	}

	@media (max-width: 639px) {
		.neon-card {
			width: min(14rem, calc(100vw - 4.5rem));
			padding: 0.8rem 0.9rem;
		}
	}
</style>
