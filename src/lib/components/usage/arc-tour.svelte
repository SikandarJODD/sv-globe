<script lang="ts">
	import type { Globe } from 'cobe';
	import { Spring } from 'svelte/motion';
	import { onDestroy, onMount } from 'svelte';

	type RoutePreset = {
		id: string;
		label: string;
		fromLabel: string;
		toLabel: string;
		from: [number, number];
		to: [number, number];
	};

	const size = 300;
	const baseTheta = 0.18;
	const thetaOffsetMin = -0.38;
	const thetaOffsetMax = 0.38;
	const routes: RoutePreset[] = [
		{
			id: 'tokyo-san-francisco',
			label: 'Tokyo -> USA',
			fromLabel: 'Tokyo',
			toLabel: 'San Francisco',
			from: [35.68, 139.65],
			to: [37.78, -122.44]
		},
		{
			id: 'london-dubai',
			label: 'London -> Dubai',
			fromLabel: 'London',
			toLabel: 'Dubai',
			from: [51.5, -0.12],
			to: [25.2, 55.27]
		},
		{
			id: 'delhi-singapore',
			label: 'Delhi -> Singapore',
			fromLabel: 'Delhi',
			toLabel: 'Singapore',
			from: [28.61, 77.21],
			to: [1.35, 103.82]
		},
		{
			id: 'sydney-tokyo',
			label: 'Sydney -> Tokyo',
			fromLabel: 'Sydney',
			toLabel: 'Tokyo',
			from: [-33.87, 151.21],
			to: [35.68, 139.65]
		},
		{
			id: 'paris-new-york',
			label: 'Paris -> NYC',
			fromLabel: 'Paris',
			toLabel: 'New York',
			from: [48.86, 2.35],
			to: [40.71, -74.01]
		}
	];

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = null;
	let observer: IntersectionObserver | null = null;
	let createGlobePromise: Promise<typeof import('cobe').default> | null = null;
	let isVisible = false;
	let isDragging = $state(false);
	let activeRouteId = $state(routes[0].id);
	let frame = 0;
	let phi = 0;
	let theta = baseTheta;
	let dragStart: { x: number; y: number; phi: number; theta: number } | null = null;
	let lastPointer: { x: number; y: number; t: number } | null = null;
	let releaseVelocity = { phi: 0, theta: 0 };
	let onWindowPointerMove: ((event: PointerEvent) => void) | null = null;
	let onWindowPointerUp: ((event: PointerEvent) => void) | null = null;

	const phiOffset = new Spring(0, {
		stiffness: 0.12,
		damping: 0.72,
		precision: 0.0001
	});

	const thetaOffset = new Spring(0, {
		stiffness: 0.12,
		damping: 0.72,
		precision: 0.0001
	});

	function clamp(value: number, min: number, max: number) {
		return Math.min(max, Math.max(min, value));
	}

	function locationToAngles(lat: number, long: number) {
		return [Math.PI - ((long * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];
	}

	function normalizeDelta(delta: number) {
		return Math.atan2(Math.sin(delta), Math.cos(delta));
	}

	function getActiveRoute() {
		return routes.find((route) => route.id === activeRouteId) ?? routes[0];
	}

	function getMarkers() {
		const route = getActiveRoute();
		return [
			{ id: `${route.id}-from`, location: route.from, size: 0.038 },
			{ id: `${route.id}-to`, location: route.to, size: 0.052 }
		];
	}

	function getArcs() {
		const route = getActiveRoute();
		return [{ id: route.id, from: route.from, to: route.to }];
	}

	function handlePointerDown(event: PointerEvent) {
		dragStart = {
			x: event.clientX,
			y: event.clientY,
			phi: phiOffset.target,
			theta: thetaOffset.target
		};
		lastPointer = { x: event.clientX, y: event.clientY, t: performance.now() };
		releaseVelocity = { phi: 0, theta: 0 };
		isDragging = true;
		canvas?.setPointerCapture?.(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!dragStart) return;

		const nextPhi = dragStart.phi + (event.clientX - dragStart.x) / 320;
		const nextTheta = clamp(
			dragStart.theta + (event.clientY - dragStart.y) / 1050,
			thetaOffsetMin,
			thetaOffsetMax
		);

		void phiOffset.set(nextPhi, { instant: true });
		void thetaOffset.set(nextTheta, { instant: true });

		const now = performance.now();
		if (lastPointer) {
			const dt = Math.max(now - lastPointer.t, 1);
			const maxVelocity = 0.14;

			releaseVelocity = {
				phi: clamp(((event.clientX - lastPointer.x) / dt) * 0.28, -maxVelocity, maxVelocity),
				theta: clamp(((event.clientY - lastPointer.y) / dt) * 0.08, -maxVelocity, maxVelocity)
			};
		}

		lastPointer = { x: event.clientX, y: event.clientY, t: now };
	}

	function handlePointerUp(event?: PointerEvent) {
		if (!dragStart) return;

		isDragging = false;
		dragStart = null;
		lastPointer = null;

		if (event && canvas?.hasPointerCapture(event.pointerId)) {
			canvas.releasePointerCapture(event.pointerId);
		}

		void phiOffset.set(phiOffset.target + releaseVelocity.phi * 18);
		void thetaOffset.set(
			clamp(thetaOffset.target + releaseVelocity.theta * 12, thetaOffsetMin, thetaOffsetMax)
		);

		releaseVelocity = { phi: 0, theta: 0 };
	}

	function animate() {
		if (!globe) {
			frame = 0;
			return;
		}

		const route = getActiveRoute();
		const [targetPhi, targetTheta] = locationToAngles(...route.to);
		const distPhi = normalizeDelta(targetPhi - phi);
		const distTheta = targetTheta - theta;

		phi += distPhi * 0.08;
		theta += distTheta * 0.08;

		globe.update({
			phi: phi + phiOffset.current,
			theta: theta + thetaOffset.current,
			markers: getMarkers(),
			arcs: getArcs()
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

		const route = getActiveRoute();
		const [initialPhi, initialTheta] = locationToAngles(...route.to);
		phi = initialPhi;
		theta = initialTheta;

		const createGlobe = await getCreateGlobe();

		if (!canvas || globe || !isVisible) return;

		globe = createGlobe(canvas, {
			devicePixelRatio: Math.min(window.devicePixelRatio, 2),
			width: size,
			height: size,
			phi,
			theta,
			dark: 0.04,
			diffuse: 1.1,
			mapSamples: 13000,
			mapBrightness: 7,
			baseColor: [0.98, 0.98, 1],
			markerColor: [0.95, 0.53, 0.16],
			glowColor: [0.94, 0.96, 1],
			markers: getMarkers(),
			arcs: getArcs(),
			arcColor: [0.99, 0.55, 0.18],
			arcWidth: 0.52,
			arcHeight: 0.18
		});

		animate();
	}

	function setActiveRoute(routeId: string) {
		activeRouteId = routeId;
	}

	onMount(() => {
		if (!canvas) return;

		onWindowPointerMove = (event: PointerEvent) => handlePointerMove(event);
		onWindowPointerUp = (event: PointerEvent) => handlePointerUp(event);

		window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
		window.addEventListener('pointerup', onWindowPointerUp, { passive: true });
		window.addEventListener('pointercancel', onWindowPointerUp, { passive: true });

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

		if (onWindowPointerMove) {
			window.removeEventListener('pointermove', onWindowPointerMove);
			onWindowPointerMove = null;
		}

		if (onWindowPointerUp) {
			window.removeEventListener('pointerup', onWindowPointerUp);
			window.removeEventListener('pointercancel', onWindowPointerUp);
			onWindowPointerUp = null;
		}

		handlePointerUp();
		destroyGlobe();
		canvas = null;
	});
</script>

<div class="tour-demo">
	<div class="globe">
		<canvas bind:this={canvas} class:dragging={isDragging} onpointerdown={handlePointerDown}
		></canvas>
	</div>

	<div class="route-list" aria-label="Choose an arc route to preview">
		{#each routes as route (route.id)}
			<button
				type="button"
				class={`route-button ${
					route.id === activeRouteId ? 'route-button-active' : 'route-button-idle'
				}`}
				onclick={() => setActiveRoute(route.id)}
			>
				{route.label}
			</button>
		{/each}
	</div>

	{const activeRoute = getActiveRoute()}
</div>

<style>
	.tour-demo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.85rem;
	}

	.globe {
		position: relative;
		width: 300px;
		height: 300px;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}

	canvas.dragging {
		cursor: grabbing;
	}

	.route-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.45rem;
		max-width: 340px;
	}

	.route-button {
		border: 1px solid transparent;
		padding: 0.45rem 0.65rem;
		font-family: var(--font-figtree);
		font-size: 0.72rem;
		line-height: 1;
		transition:
			transform 0.2s,
			border-color 0.2s,
			background-color 0.2s,
			color 0.2s;
	}

	.route-button:hover {
		transform: translateY(-1px);
	}

	.route-button-idle {
		border-color: rgb(15 23 42 / 0.1);
		background: rgb(255 255 255 / 0.9);
		color: rgb(15 23 42 / 0.7);
	}

	.route-button-active {
		border-color: rgb(194 65 12 / 0.2);
		background: rgb(246, 96, 46);
		color: rgb(255 247 237);
	}

	.route-caption {
		font-family: var(--font-figtree);
		font-size: 0.8rem;
		color: rgb(15 23 42 / 0.68);
	}
</style>
