<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { Globe } from 'cobe';
	import { Spring } from 'svelte/motion';

	import { cdnArcs, cdnMarkers, showcaseConfigs } from './showcase-data';

	const config = showcaseConfigs.cdn;
	const thetaOffsetMin = -0.32;
	const thetaOffsetMax = 0.28;

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = $state(null);
	let observer: IntersectionObserver | null = null;
	let createGlobePromise: Promise<typeof import('cobe').default> | null = null;
	let frame = 0;
	let isVisible = false;
	let isDragging = $state(false);
	let autoPhi = 0;
	let dragStart: { x: number; y: number; phi: number; theta: number } | null = null;
	let lastPointer: { x: number; y: number; t: number } | null = null;
	let releaseVelocity = { phi: 0, theta: 0 };

	const phiOffset = new Spring(0, {
		stiffness: 0.11,
		damping: 0.78,
		precision: 0.0001
	});

	const thetaOffset = new Spring(0, {
		stiffness: 0.11,
		damping: 0.78,
		precision: 0.0001
	});

	function clamp(value: number, min: number, max: number) {
		return Math.min(max, Math.max(min, value));
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

		if (!isDragging) {
			autoPhi += 0.0028;
		}

		globe.update({
			phi: autoPhi + phiOffset.current,
			theta: config.theta + thetaOffset.current
		});

		frame = requestAnimationFrame(animate);
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

		const nextPhi = dragStart.phi + (event.clientX - dragStart.x) / 340;
		const nextTheta = clamp(
			dragStart.theta + (event.clientY - dragStart.y) / 1150,
			thetaOffsetMin,
			thetaOffsetMax
		);

		void phiOffset.set(nextPhi, { instant: true });
		void thetaOffset.set(nextTheta, { instant: true });

		const now = performance.now();
		if (lastPointer) {
			const dt = Math.max(now - lastPointer.t, 1);
			const maxVelocity = 0.12;

			releaseVelocity = {
				phi: clamp(((event.clientX - lastPointer.x) / dt) * 0.24, -maxVelocity, maxVelocity),
				theta: clamp(((event.clientY - lastPointer.y) / dt) * 0.06, -maxVelocity, maxVelocity)
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
			clamp(thetaOffset.target + releaseVelocity.theta * 14, thetaOffsetMin, thetaOffsetMax)
		);

		releaseVelocity = { phi: 0, theta: 0 };
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

		const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
		const renderedSize = Math.max(
			320,
			Math.round(canvas.getBoundingClientRect().width * devicePixelRatio)
		);

		globe = createGlobe(canvas, {
			devicePixelRatio,
			width: renderedSize,
			height: renderedSize,
			phi: autoPhi + phiOffset.current,
			theta: config.theta + thetaOffset.current,
			dark: config.dark,
			diffuse: 1.35,
			mapSamples: 14000,
			mapBrightness: config.mapBrightness,
			baseColor: config.baseColor,
			markerColor: config.markerColor,
			glowColor: [0.95, 0.95, 0.95],
			markers: cdnMarkers.map(({ id, location }) => ({
				id,
				location,
				size: config.markerSize
			})),
			markerElevation: config.markerElevation,
			arcs: cdnArcs.map(({ from, to, id }) => ({ from, to, id })),
			arcColor: config.arcColor,
			arcWidth: 0.45,
			arcHeight: 0.16,
			opacity: 0.82
		});

		animate();
	}

	let onWindowPointerMove: ((event: PointerEvent) => void) | null = null;
	let onWindowPointerUp: ((event: PointerEvent) => void) | null = null;

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
			{ threshold: 0.15 }
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

<div class="showcases-demo">
	<div class="showcases-globe">
		<canvas
			bind:this={canvas}
			class="showcases-canvas"
			class:is-ready={!!globe}
			class:dragging={isDragging}
			onpointerdown={handlePointerDown}
		></canvas>

		{#each cdnMarkers as marker (marker.id)}
			<div
				class="showcase-cdn"
				style={`position-anchor: --cobe-${marker.id}; --marker-visible: var(--cobe-visible-${marker.id}, 0);`}
			>
				<div class="showcase-cdn-pyramid">
					<div class="showcase-cdn-pyramid-face"></div>
					<div class="showcase-cdn-pyramid-face"></div>
					<div class="showcase-cdn-pyramid-face"></div>
					<div class="showcase-cdn-pyramid-face"></div>
				</div>
				<span class="showcase-cdn-label">{marker.region}</span>
			</div>
		{/each}

		{#each cdnArcs as arc (arc.id)}
			<div
				class="showcase-cdn-arc-label"
				style={`position-anchor: --cobe-arc-${arc.id}; --arc-visible: var(--cobe-visible-arc-${arc.id}, 0);`}
			>
				{arc.traffic}
			</div>
		{/each}
	</div>
</div>

<style>
	.showcases-demo {
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: center;
	}

	.showcases-globe {
		position: relative;
		width: 350px;
		height: 350px;
		aspect-ratio: 1;
		user-select: none;
	}

	@media (min-width: 640px) {
		.showcases-globe {
			width: 520px;
			height: 520px;
		}
	}

	.showcases-canvas {
		width: 100%;
		height: 100%;
		aspect-ratio: 1;
		border-radius: 9999px;
		cursor: grab;
		opacity: 0;
		touch-action: none;
		transition: opacity 0.8s ease;
	}

	.showcases-canvas.is-ready {
		opacity: 1;
	}

	.showcases-canvas.dragging,
	.showcases-canvas:active {
		cursor: grabbing;
	}

	.showcase-cdn {
		position: absolute;
		bottom: anchor(top);
		left: anchor(center);
		translate: -50% 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		opacity: var(--marker-visible);
		filter: blur(calc((1 - var(--marker-visible)) * 8px));
		transition:
			opacity 0.3s ease,
			filter 0.3s ease;
		pointer-events: none;
	}

	.showcase-cdn-pyramid {
		position: relative;
		width: 12px;
		height: 12px;
		transform-style: preserve-3d;
		animation: pyramid-spin 4s linear infinite;
	}

	.showcase-cdn-pyramid-face {
		position: absolute;
		top: 0;
		left: -0.5px;
		width: 0;
		height: 0;
		border-right: 6.5px solid transparent;
		border-bottom: 13px solid #000;
		border-left: 6.5px solid transparent;
		transform-origin: center bottom;
	}

	.showcase-cdn-pyramid-face:nth-child(1) {
		transform: rotateY(0deg) translateZ(4px) rotateX(19.5deg);
		border-bottom-color: #111;
	}

	.showcase-cdn-pyramid-face:nth-child(2) {
		transform: rotateY(120deg) translateZ(4px) rotateX(19.5deg);
		border-bottom-color: #333;
	}

	.showcase-cdn-pyramid-face:nth-child(3) {
		transform: rotateY(240deg) translateZ(4px) rotateX(19.5deg);
		border-bottom-color: #555;
	}

	.showcase-cdn-pyramid-face:nth-child(4) {
		transform: rotateX(-90deg) rotateZ(60deg) translateY(4px);
		border-bottom-color: #222;
	}

	.showcase-cdn-label {
		border-radius: 999px;
		background: rgb(255 255 255 / 0.96);
		box-shadow: 0 6px 18px rgb(15 23 42 / 0.12);
		color: #111;
		font-family: var(--font-mono), monospace;
		font-size: 0.55rem;
		letter-spacing: 0.05em;
		padding: 2px 6px;
		white-space: nowrap;
	}

	.showcase-cdn-arc-label {
		position: absolute;
		bottom: anchor(top);
		left: anchor(center);
		translate: -50% 0;
		border-radius: 999px;
		background: rgb(17 17 17 / 0.94);
		box-shadow: 0 8px 20px rgb(15 23 42 / 0.18);
		color: #fff;
		font-family: var(--font-mono), monospace;
		font-size: 0.5rem;
		letter-spacing: 0.04em;
		opacity: var(--arc-visible);
		filter: blur(calc((1 - var(--arc-visible)) * 8px));
		padding: 3px 8px;
		transition:
			opacity 0.3s ease,
			filter 0.3s ease;
		white-space: nowrap;
		pointer-events: none;
	}

	@keyframes pyramid-spin {
		0% {
			transform: rotateX(20deg) rotateY(0deg);
		}

		100% {
			transform: rotateX(20deg) rotateY(360deg);
		}
	}

	@media (max-width: 640px) {
		.showcase-cdn-pyramid {
			width: 10px;
			height: 10px;
		}

		.showcase-cdn-pyramid-face {
			border-right-width: 5.5px;
			border-bottom-width: 11px;
			border-left-width: 5.5px;
		}

		.showcase-cdn-pyramid-face:nth-child(1) {
			transform: rotateY(0deg) translateZ(3.3px) rotateX(19.5deg);
		}

		.showcase-cdn-pyramid-face:nth-child(2) {
			transform: rotateY(120deg) translateZ(3.3px) rotateX(19.5deg);
		}

		.showcase-cdn-pyramid-face:nth-child(3) {
			transform: rotateY(240deg) translateZ(3.3px) rotateX(19.5deg);
		}

		.showcase-cdn-pyramid-face:nth-child(4) {
			transform: rotateX(-90deg) rotateZ(60deg) translateY(3px);
		}

		.showcase-cdn-label {
			font-size: 0.45rem;
			padding: 1px 4px;
		}

		.showcase-cdn-arc-label {
			font-size: 0.4rem;
			padding: 2px 6px;
		}
	}
</style>
