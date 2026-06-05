<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { Globe } from 'cobe';
	import { Spring } from 'svelte/motion';

	import { polaroidMarkers, showcaseConfigs } from './showcase-data';

	const config = showcaseConfigs.polaroids;
	const thetaOffsetMin = -0.35;
	const thetaOffsetMax = 0.3;

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
		stiffness: 0.1,
		damping: 0.8,
		precision: 0.0001
	});

	const thetaOffset = new Spring(0, {
		stiffness: 0.1,
		damping: 0.8,
		precision: 0.0001
	});

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
			autoPhi += 0.003;
		}

		globe.update({
			phi: autoPhi + phiOffset.current,
			theta: config.theta + thetaOffset.current
		});
		frame = requestAnimationFrame(animate);
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(max, Math.max(min, value));
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

		const nextPhi = dragStart.phi + (event.clientX - dragStart.x) / 360;
		const nextTheta = clamp(
			dragStart.theta + (event.clientY - dragStart.y) / 1100,
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

		void phiOffset.set(phiOffset.target + releaseVelocity.phi * 20);
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
			mapSamples: 13000,
			mapBrightness: config.mapBrightness,
			baseColor: config.baseColor,
			markerColor: config.markerColor,
			glowColor: [0.96, 0.95, 0.92],
			markers: polaroidMarkers.map(({ id, location }) => ({
				id,
				location,
				size: config.markerSize
			})),
			markerElevation: config.markerElevation,
			arcColor: config.arcColor,
			opacity: 0.9
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

		{#each polaroidMarkers as marker (marker.id)}
			<div
				class="showcase-polaroid"
				style={`position-anchor: --cobe-${marker.id}; --marker-visible: var(--cobe-visible-${marker.id}, 0); --polaroid-rotate: ${marker.rotate}deg;`}
			>
				<img src={marker.image} alt={marker.caption} loading="lazy" />
				<span class="showcase-polaroid-caption">{marker.caption}</span>
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

	.showcase-polaroid {
		position: absolute;
		bottom: anchor(top);
		left: anchor(center);
		translate: -50% 0;
		width: 84px;
		padding: 6px 6px 22px;
		border-radius: 2px;
		background: #fff;
		box-shadow:
			0 10px 24px rgb(15 23 42 / 0.16),
			0 4px 10px rgb(15 23 42 / 0.12);
		opacity: var(--marker-visible);
		filter: blur(calc((1 - var(--marker-visible)) * 10px));
		transform: rotate(var(--polaroid-rotate, 0deg));
		transform-origin: center bottom;
		transition:
			opacity 0.25s ease,
			filter 0.25s ease;
		pointer-events: none;
	}

	.showcase-polaroid img {
		display: block;
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
	}

	.showcase-polaroid-caption {
		position: absolute;
		right: 8px;
		bottom: 6px;
		left: 8px;
		text-align: center;
		font-family: var(--font-sans), sans-serif;
		font-size: 0.6rem;
		letter-spacing: 0.04em;
		color: #334155;
		text-transform: uppercase;
	}

	@media (max-width: 640px) {
		.showcase-polaroid {
			width: 64px;
			padding: 4px 4px 18px;
		}

		.showcase-polaroid-caption {
			right: 5px;
			bottom: 5px;
			left: 5px;
			font-size: 0.45rem;
		}
	}
</style>
