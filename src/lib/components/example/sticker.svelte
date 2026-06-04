<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { Globe } from 'cobe';
	import { Spring } from 'svelte/motion';

	import { showcaseConfigs, stickerMarkers } from './showcase-data';

	const config = showcaseConfigs.stickers;
	const thetaOffsetMin = -0.4;
	const thetaOffsetMax = 0.35;

	let canvas: HTMLCanvasElement | null = null;
	let globe: Globe | null = $state(null);
	let observer: IntersectionObserver | null = null;
	let createGlobePromise: Promise<typeof import('cobe').default> | null = null;
	let frame = 0;
	let isVisible = $state(false);
	let isDragging = $state(false);
	let autoPhi = 0;
	let dragStart: { x: number; y: number; phi: number; theta: number } | null = null;
	let lastPointer: { x: number; y: number; t: number } | null = null;
	let releaseVelocity = { phi: 0, theta: 0 };

	const phiOffset = new Spring(0, {
		stiffness: 0.12,
		damping: 0.7,
		precision: 0.0001
	});

	const thetaOffset = new Spring(0, {
		stiffness: 0.12,
		damping: 0.7,
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

		const nextPhi = dragStart.phi + (event.clientX - dragStart.x) / 300;
		const nextTheta = clamp(
			dragStart.theta + (event.clientY - dragStart.y) / 1000,
			thetaOffsetMin,
			thetaOffsetMax
		);

		void phiOffset.set(nextPhi, { instant: true });
		void thetaOffset.set(nextTheta, { instant: true });

		const now = performance.now();
		if (lastPointer) {
			const dt = Math.max(now - lastPointer.t, 1);
			const maxVelocity = 0.15;

			releaseVelocity = {
				phi: clamp(((event.clientX - lastPointer.x) / dt) * 0.3, -maxVelocity, maxVelocity),
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
			diffuse: 1.5,
			mapSamples: 13000,
			mapBrightness: config.mapBrightness,
			baseColor: config.baseColor,
			markerColor: config.markerColor,
			glowColor: [0.94, 0.93, 0.91],
			markers: stickerMarkers.map(({ id, location }) => ({
				id,
				location,
				size: config.markerSize
			})),
			markerElevation: config.markerElevation,
			arcColor: config.arcColor,
			arcWidth: 0.5,
			arcHeight: 0.25,
			opacity: 0.7
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

		{#each stickerMarkers as marker (marker.id)}
			<div
				class="showcase-sticker"
				style={`position-anchor: --cobe-${marker.id}; opacity: var(--cobe-visible-${marker.id}, 0);`}
			>
				{marker.sticker}
			</div>
		{/each}

		<svg aria-hidden="true" class="showcase-filter">
			<defs>
				<filter id="sticker-outline" x="-40%" y="-40%" width="180%" height="180%">
					<feMorphology in="SourceAlpha" operator="dilate" radius="2.2" result="outline" />
					<feFlood flood-color="white" result="outline-color" />
					<feComposite in="outline-color" in2="outline" operator="in" result="sticker-fill" />
					<feMerge>
						<feMergeNode in="sticker-fill" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>
		</svg>
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
		transition: opacity 0.8s ease;
		touch-action: none;
	}

	.showcases-canvas.is-ready {
		opacity: 1;
	}

	.showcases-canvas.dragging,
	.showcases-canvas:active {
		cursor: grabbing;
	}

	.showcase-sticker {
		position: absolute;
		bottom: anchor(top);
		left: anchor(center);
		/* translate: -50% 0; */
		font-size: 2rem;
		line-height: 1;
		transform: rotate(-12deg);
		filter: url(#sticker-outline) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
		transition:
			opacity 0.2s,
			filter 0.2s;
		pointer-events: none;
	}

	.showcase-sticker:nth-child(3n) {
		transform: rotate(6deg);
	}

	.showcase-sticker:nth-child(4n) {
		transform: rotate(-4deg);
	}

	.showcase-sticker:nth-child(5n) {
		transform: rotate(10deg);
	}

	/* .showcase-filter {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
		pointer-events: none;
	} */
</style>
