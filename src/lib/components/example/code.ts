const stickerCode = `<script lang="ts">
\timport { onDestroy, onMount } from 'svelte';
\timport type { Globe } from 'cobe';
\timport { Spring } from 'svelte/motion';
\timport { showcaseConfigs, stickerMarkers } from './showcase-data';

\tconst config = showcaseConfigs.stickers;
\tconst thetaOffsetMin = -0.4;
\tconst thetaOffsetMax = 0.35;

\tlet canvas: HTMLCanvasElement | null = null;
\tlet globe: Globe | null = null;
\tlet observer: IntersectionObserver | null = null;
\tlet createGlobePromise: Promise<typeof import('cobe').default> | null = null;
\tlet frame = 0;
\tlet isVisible = false;
\tlet isDragging = false;
\tlet autoPhi = 0;
\tlet dragStart: { x: number; y: number; phi: number; theta: number } | null = null;
\tlet lastPointer: { x: number; y: number; t: number } | null = null;
\tlet releaseVelocity = { phi: 0, theta: 0 };

\tconst phiOffset = new Spring(0, {
\t\tstiffness: 0.12,
\t\tdamping: 0.7,
\t\tprecision: 0.0001
\t});

\tconst thetaOffset = new Spring(0, {
\t\tstiffness: 0.12,
\t\tdamping: 0.7,
\t\tprecision: 0.0001
\t});

\tfunction animate() {
\t\tif (!globe) {
\t\t\tframe = 0;
\t\t\treturn;
\t\t}

\t\tif (!isDragging) autoPhi += 0.0035;

\t\tglobe.update({
\t\t\tphi: autoPhi + phiOffset.current,
\t\t\ttheta: config.theta + thetaOffset.current
\t\t});

\t\tframe = requestAnimationFrame(animate);
\t}

\tfunction clamp(value: number, min: number, max: number) {
\t\treturn Math.min(max, Math.max(min, value));
\t}

\tfunction destroyGlobe() {
\t\tif (frame) cancelAnimationFrame(frame);
\t\tframe = 0;
\t\tglobe?.destroy();
\t\tglobe = null;
\t}

\tasync function getCreateGlobe() {
\t\tcreateGlobePromise ??= import('cobe').then((module) => module.default);
\t\treturn createGlobePromise;
\t}

\tasync function startGlobe() {
\t\tif (!canvas) return;

\t\tif (globe) {
\t\t\tif (!frame) animate();
\t\t\treturn;
\t\t}

\t\tconst createGlobe = await getCreateGlobe();
\t\tif (!canvas || globe || !isVisible) return;

\t\tconst devicePixelRatio = Math.min(window.devicePixelRatio, 2);
\t\tconst renderedSize = Math.max(320, Math.round(canvas.getBoundingClientRect().width * devicePixelRatio));

\t\tglobe = createGlobe(canvas, {
\t\t\tdevicePixelRatio,
\t\t\twidth: renderedSize,
\t\t\theight: renderedSize,
\t\t\tphi: autoPhi + phiOffset.current,
\t\t\ttheta: config.theta + thetaOffset.current,
\t\t\tdark: config.dark,
\t\t\tdiffuse: 1.15,
\t\t\tmapSamples: 16000,
\t\t\tmapBrightness: config.mapBrightness,
\t\t\tbaseColor: config.baseColor,
\t\t\tmarkerColor: config.markerColor,
\t\t\tglowColor: [1, 1, 1],
\t\t\tmarkerSize: config.markerSize,
\t\t\tmarkers: stickerMarkers.map(({ id, location }) => ({
\t\t\t\tid,
\t\t\t\tlocation,
\t\t\t\tsize: config.markerSize
\t\t\t}))
\t\t});

\t\tanimate();
\t}

\tfunction handlePointerDown(event: PointerEvent) {
\t\tdragStart = {
\t\t\tx: event.clientX,
\t\t\ty: event.clientY,
\t\t\tphi: phiOffset.target,
\t\t\ttheta: thetaOffset.target
\t\t};
\t\tisDragging = true;
\t\tlastPointer = { x: event.clientX, y: event.clientY, t: performance.now() };
\t\treleaseVelocity = { phi: 0, theta: 0 };
\t\tcanvas?.setPointerCapture?.(event.pointerId);
\t}

\tfunction handlePointerMove(event: PointerEvent) {
\t\tif (!dragStart) return;

\t\tconst nextPhi = dragStart.phi + (event.clientX - dragStart.x) / 300;
\t\tconst nextTheta = clamp(
\t\t\tdragStart.theta + (event.clientY - dragStart.y) / 1000,
\t\t\tthetaOffsetMin,
\t\t\tthetaOffsetMax
\t\t);

\t\tvoid phiOffset.set(nextPhi, { instant: true });
\t\tvoid thetaOffset.set(nextTheta, { instant: true });

\t\tconst now = performance.now();
\t\tif (lastPointer) {
\t\t\tconst dt = Math.max(now - lastPointer.t, 1);
\t\t\tconst maxVelocity = 0.15;

\t\t\treleaseVelocity = {
\t\t\t\tphi: clamp(((event.clientX - lastPointer.x) / dt) * 0.3, -maxVelocity, maxVelocity),
\t\t\t\ttheta: clamp(((event.clientY - lastPointer.y) / dt) * 0.08, -maxVelocity, maxVelocity)
\t\t\t};
\t\t}

\t\tlastPointer = { x: event.clientX, y: event.clientY, t: now };
\t}

\tfunction handlePointerUp(event?: PointerEvent) {
\t\tif (!dragStart) return;
\t\tdragStart = null;
\t\tisDragging = false;
\t\tlastPointer = null;

\t\tif (event && canvas?.hasPointerCapture(event.pointerId)) {
\t\t\tcanvas.releasePointerCapture(event.pointerId);
\t\t}

\t\tvoid phiOffset.set(phiOffset.target + releaseVelocity.phi * 18);
\t\tvoid thetaOffset.set(
\t\t\tclamp(thetaOffset.target + releaseVelocity.theta * 12, thetaOffsetMin, thetaOffsetMax)
\t\t);

\t\treleaseVelocity = { phi: 0, theta: 0 };
\t}

\tlet onWindowPointerMove: ((event: PointerEvent) => void) | null = null;
\tlet onWindowPointerUp: ((event: PointerEvent) => void) | null = null;

\tonMount(() => {
\t\tif (!canvas) return;

\t\tonWindowPointerMove = (event: PointerEvent) => handlePointerMove(event);
\t\tonWindowPointerUp = (event: PointerEvent) => handlePointerUp(event);

\t\twindow.addEventListener('pointermove', onWindowPointerMove, { passive: true });
\t\twindow.addEventListener('pointerup', onWindowPointerUp, { passive: true });
\t\twindow.addEventListener('pointercancel', onWindowPointerUp, { passive: true });

\t\tobserver = new IntersectionObserver(([entry]) => {
\t\t\tif (!entry) return;

\t\t\tisVisible = entry.isIntersecting;
\t\t\tif (isVisible) {
\t\t\t\tvoid startGlobe();
\t\t\t\treturn;
\t\t\t}

\t\t\tif (frame) {
\t\t\t\tcancelAnimationFrame(frame);
\t\t\t\tframe = 0;
\t\t\t}
\t\t}, { threshold: 0.15 });

\t\tobserver.observe(canvas);
\t});

\tonDestroy(() => {
\t\tobserver?.disconnect();

\t\tif (onWindowPointerMove) {
\t\t\twindow.removeEventListener('pointermove', onWindowPointerMove);
\t\t\tonWindowPointerMove = null;
\t\t}

\t\tif (onWindowPointerUp) {
\t\t\twindow.removeEventListener('pointerup', onWindowPointerUp);
\t\t\twindow.removeEventListener('pointercancel', onWindowPointerUp);
\t\t\tonWindowPointerUp = null;
\t\t}

\t\thandlePointerUp();
\t\tdestroyGlobe();
\t});
</script>

<div class="showcases-globe">
\t<canvas
\t\tbind:this={canvas}
\t\tclass="showcases-canvas"
\t\tonpointerdown={handlePointerDown}
\t></canvas>

\t{#each stickerMarkers as marker (marker.id)}
\t\t<div
\t\t\tclass="showcase-sticker"
\t\t\tstyle={\`position-anchor: --cobe-\${marker.id}; opacity: var(--cobe-visible-\${marker.id}, 0);\`}
\t\t>
\t\t\t{marker.sticker}
\t\t</div>
\t{/each}
</div>`;

export const exampleCode = {
	sticker: stickerCode
} as const;
