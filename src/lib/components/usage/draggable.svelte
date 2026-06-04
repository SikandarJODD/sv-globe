<script lang="ts">
	import createGlobe from 'cobe';
	import { type Globe } from 'cobe';
	import { Spring, Tween } from 'svelte/motion';
	import { onMount } from 'svelte';

	const size = 300;
	const baseTheta = 0.2;
	const thetaOffsetMin = -0.4;
	const thetaOffsetMax = 0.4;

	let canvas: HTMLCanvasElement | null = $state(null);
	let globe: Globe | null = $state(null);
	let isDragging = $state(false);

	let frame = $state(0);
	let autoPhi = $state(0);
	let dragStart: { x: number; y: number; phi: number; theta: number } | null = $state(null);
	let lastPointer: { x: number; y: number; t: number } | null = $state(null);
	let releaseVelocity = $state({ phi: 0, theta: 0 });

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

	onMount(() => {
		if (!canvas) return;

		globe = createGlobe(canvas, {
			devicePixelRatio: Math.min(window.devicePixelRatio, 2),
			width: size,
			height: size,
			phi: 0,
			theta: baseTheta,
			dark: 0,
			diffuse: 1.2,
			mapSamples: 16000,
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

		const onWindowPointerMove = (event: PointerEvent) => handlePointerMove(event);
		const onWindowPointerUp = (event: PointerEvent) => handlePointerUp(event);

		window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
		window.addEventListener('pointerup', onWindowPointerUp, { passive: true });
		window.addEventListener('pointercancel', onWindowPointerUp, { passive: true });

		function animate() {
			// comment below code to disable auto-rotation
			if (!isDragging) {
				autoPhi += 0.005;
			}

			globe?.update({
				phi: autoPhi + phiOffset.current,
				theta: baseTheta + thetaOffset.current
			});

			frame = requestAnimationFrame(animate);
		}

		animate();

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('pointermove', onWindowPointerMove);
			window.removeEventListener('pointerup', onWindowPointerUp);
			window.removeEventListener('pointercancel', onWindowPointerUp);
			globe?.destroy();
		};
	});
</script>

<div class="globe">
	<canvas bind:this={canvas} class:dragging={isDragging} onpointerdown={handlePointerDown}></canvas>
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
		cursor: grab;
		touch-action: none;
		user-select: none;
		/* border: 1px solid #d4d4d8; */
	}

	canvas.dragging {
		cursor: grabbing;
	}
</style>
