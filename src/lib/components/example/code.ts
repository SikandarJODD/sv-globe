const stickerCode = `<script lang="ts">
\timport { onDestroy, onMount } from 'svelte';
\timport type { Globe } from 'cobe';
\timport { Spring } from 'svelte/motion';

\t// Keep the globe theme close to the preview component.
\tconst config = {
\t\ttheta: 0.2,
\t\tdark: 0,
\t\tmapBrightness: 8,
\t\tmarkerColor: [0.85, 0.35, 0.6] as [number, number, number],
\t\tbaseColor: [1, 1, 1] as [number, number, number],
\t\tmarkerSize: 0.03
\t};

\t// Inline sticker data keeps the example self-contained for copy/paste.
\tconst stickerMarkers = [
\t\t{ id: 'sticker-paris', location: [48.86, 2.35] as [number, number], sticker: '🥐' },
\t\t{ id: 'sticker-tokyo', location: [35.68, 139.65] as [number, number], sticker: '🗼' },
\t\t{ id: 'sticker-nyc', location: [40.71, -74.01] as [number, number], sticker: '🍎' },
\t\t{ id: 'sticker-rio', location: [-22.91, -43.17] as [number, number], sticker: '🎭' },
\t\t{ id: 'sticker-sydney', location: [-33.87, 151.21] as [number, number], sticker: '🐨' },
\t\t{ id: 'sticker-cairo', location: [30.04, 31.24] as [number, number], sticker: '🐪' },
\t\t{ id: 'sticker-london', location: [51.51, -0.13] as [number, number], sticker: '☕' },
\t\t{ id: 'sticker-seoul', location: [37.57, 126.98] as [number, number], sticker: '🎮' }
\t];

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

\t// Spring offsets make drag + release feel less mechanical.
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

\tfunction clamp(value: number, min: number, max: number) {
\t\treturn Math.min(max, Math.max(min, value));
\t}

\tfunction stopAnimation() {
\t\tif (!frame) return;
\t\tcancelAnimationFrame(frame);
\t\tframe = 0;
\t}

\tfunction destroyGlobe() {
\t\tstopAnimation();
\t\tglobe?.destroy();
\t\tglobe = null;
\t}

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
\t\tlastPointer = { x: event.clientX, y: event.clientY, t: performance.now() };
\t\treleaseVelocity = { phi: 0, theta: 0 };
\t\tisDragging = true;
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

\t\tisDragging = false;
\t\tdragStart = null;
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

\t\t// Lazy-start the globe so the preview does not render off-screen.
\t\tobserver = new IntersectionObserver(([entry]) => {
\t\t\tif (!entry) return;

\t\t\tisVisible = entry.isIntersecting;
\t\t\tif (isVisible) {
\t\t\t\tvoid startGlobe();
\t\t\t\treturn;
\t\t\t}

\t\t\tstopAnimation();
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
\t\tclass:dragging={isDragging}
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

\t<svg aria-hidden="true" class="showcase-filter">
\t\t<defs>
\t\t\t<filter id="sticker-outline" x="-40%" y="-40%" width="180%" height="180%">
\t\t\t\t<feMorphology in="SourceAlpha" operator="dilate" radius="2.2" result="outline" />
\t\t\t\t<feFlood flood-color="white" result="outline-color" />
\t\t\t\t<feComposite in="outline-color" in2="outline" operator="in" result="sticker-fill" />
\t\t\t\t<feMerge>
\t\t\t\t\t<feMergeNode in="sticker-fill" />
\t\t\t\t\t<feMergeNode in="SourceGraphic" />
\t\t\t\t</feMerge>
\t\t\t</filter>
\t\t</defs>
\t</svg>
</div>

<style>
\t.showcases-globe {
\t\tposition: relative;
\t\twidth: min(100%, 26rem);
\t\taspect-ratio: 1;
\t\tuser-select: none;
\t}

\t.showcases-canvas {
\t\twidth: 100%;
\t\theight: 100%;
\t\taspect-ratio: 1;
\t\tborder-radius: 9999px;
\t\tcursor: grab;
\t\ttouch-action: none;
\t}

\t.showcases-canvas.dragging {
\t\tcursor: grabbing;
\t}

\t.showcase-sticker {
\t\tposition: absolute;
\t\tbottom: anchor(top);
\t\tleft: anchor(center);
\t\ttranslate: -50% 0;
\t\tfont-size: clamp(1.6rem, 1rem + 1vw, 2rem);
\t\tline-height: 1;
\t\ttransform: rotate(-8deg);
\t\tfilter: url(#sticker-outline) drop-shadow(0 2px 3px rgb(0 0 0 / 0.3));
\t\tpointer-events: none;
\t\ttransition: opacity 0.2s;
\t}

\t.showcase-sticker:nth-child(3n) {
\t\ttransform: rotate(6deg);
\t}

\t.showcase-sticker:nth-child(4n) {
\t\ttransform: rotate(-4deg);
\t}

\t.showcase-sticker:nth-child(5n) {
\t\ttransform: rotate(10deg);
\t}

\t.showcase-filter {
\t\tposition: absolute;
\t\twidth: 0;
\t\theight: 0;
\t\toverflow: hidden;
\t\tpointer-events: none;
\t}
</style>`;

const polaroidCode = `<script lang="ts">
\timport createGlobe from 'cobe';
\timport type { Globe } from 'cobe';
\timport { Spring } from 'svelte/motion';
\timport { onMount } from 'svelte';

\tconst config = {
\t\ttheta: 0.2,
\t\tdark: 0,
\t\tmapBrightness: 9,
\t\tmarkerColor: [0.4, 0.6, 0.9] as [number, number, number],
\t\tbaseColor: [1, 1, 1] as [number, number, number],
\t\tmarkerSize: 0.02
\t};
\tconst thetaOffsetMin = -0.35;
\tconst thetaOffsetMax = 0.3;

\tconst polaroidMarkers = [
\t\t{ id: 'polaroid-sf', location: [37.78, -122.44] as [number, number], image: '/img/sf.jpg', caption: 'San Francisco', rotate: -5 },
\t\t{ id: 'polaroid-nyc', location: [40.71, -74.01] as [number, number], image: '/img/nyc.jpg', caption: 'New York', rotate: 4 },
\t\t{ id: 'polaroid-tokyo', location: [35.68, 139.65] as [number, number], image: '/img/tokyo.jpg', caption: 'Tokyo', rotate: -3 },
\t\t{ id: 'polaroid-sydney', location: [-33.87, 151.21] as [number, number], image: '/img/sydney.jpg', caption: 'Sydney', rotate: 6 }
\t];

\tlet canvas: HTMLCanvasElement | null = null;
\tlet globe: Globe | null = $state(null);
\tlet frame = 0;
\tlet isDragging = $state(false);
\tlet autoPhi = 0;
\tlet dragStart: { x: number; y: number; phi: number; theta: number } | null = null;
\tlet lastPointer: { x: number; y: number; t: number } | null = null;
\tlet releaseVelocity = { phi: 0, theta: 0 };

\tconst phiOffset = new Spring(0, { stiffness: 0.1, damping: 0.8, precision: 0.0001 });
\tconst thetaOffset = new Spring(0, { stiffness: 0.1, damping: 0.8, precision: 0.0001 });

\tfunction animate() {
\t\tif (!isDragging) autoPhi += 0.003;

\t\tglobe?.update({
\t\t\tphi: autoPhi + phiOffset.current,
\t\t\ttheta: config.theta + thetaOffset.current
\t\t});

\t\tframe = requestAnimationFrame(animate);
\t}

\tfunction clamp(value: number, min: number, max: number) {
\t\treturn Math.min(max, Math.max(min, value));
\t}

\tfunction handlePointerDown(event: PointerEvent) {
\t\tdragStart = {
\t\t\tx: event.clientX,
\t\t\ty: event.clientY,
\t\t\tphi: phiOffset.target,
\t\t\ttheta: thetaOffset.target
\t\t};
\t\tlastPointer = { x: event.clientX, y: event.clientY, t: performance.now() };
\t\treleaseVelocity = { phi: 0, theta: 0 };
\t\tisDragging = true;
\t\tcanvas?.setPointerCapture?.(event.pointerId);
\t}

\tfunction handlePointerMove(event: PointerEvent) {
\t\tif (!dragStart) return;

\t\tconst nextPhi = dragStart.phi + (event.clientX - dragStart.x) / 360;
\t\tconst nextTheta = clamp(
\t\t\tdragStart.theta + (event.clientY - dragStart.y) / 1100,
\t\t\tthetaOffsetMin,
\t\t\tthetaOffsetMax
\t\t);

\t\tvoid phiOffset.set(nextPhi, { instant: true });
\t\tvoid thetaOffset.set(nextTheta, { instant: true });

\t\tconst now = performance.now();
\t\tif (lastPointer) {
\t\t\tconst dt = Math.max(now - lastPointer.t, 1);
\t\t\tconst maxVelocity = 0.12;

\t\t\treleaseVelocity = {
\t\t\t\tphi: clamp(((event.clientX - lastPointer.x) / dt) * 0.24, -maxVelocity, maxVelocity),
\t\t\t\ttheta: clamp(((event.clientY - lastPointer.y) / dt) * 0.06, -maxVelocity, maxVelocity)
\t\t\t};
\t\t}

\t\tlastPointer = { x: event.clientX, y: event.clientY, t: now };
\t}

\tfunction handlePointerUp(event?: PointerEvent) {
\t\tif (!dragStart) return;

\t\tisDragging = false;
\t\tdragStart = null;
\t\tlastPointer = null;

\t\tif (event && canvas?.hasPointerCapture(event.pointerId)) {
\t\t\tcanvas.releasePointerCapture(event.pointerId);
\t\t}

\t\tvoid phiOffset.set(phiOffset.target + releaseVelocity.phi * 20);
\t\tvoid thetaOffset.set(
\t\t\tclamp(thetaOffset.target + releaseVelocity.theta * 14, thetaOffsetMin, thetaOffsetMax)
\t\t);

\t\treleaseVelocity = { phi: 0, theta: 0 };
\t}

\tonMount(() => {
\t\tif (!canvas) return;

\t\tconst onPointerMove = (event: PointerEvent) => handlePointerMove(event);
\t\tconst onPointerUp = (event: PointerEvent) => handlePointerUp(event);

\t\twindow.addEventListener('pointermove', onPointerMove, { passive: true });
\t\twindow.addEventListener('pointerup', onPointerUp, { passive: true });
\t\twindow.addEventListener('pointercancel', onPointerUp, { passive: true });

\t\tglobe = createGlobe(canvas, {
\t\t\tdevicePixelRatio: Math.min(window.devicePixelRatio, 2),
\t\t\twidth: 320,
\t\t\theight: 320,
\t\t\tphi: autoPhi + phiOffset.current,
\t\t\ttheta: config.theta + thetaOffset.current,
\t\t\tdark: config.dark,
\t\t\tdiffuse: 1.35,
\t\t\tmapSamples: 13000,
\t\t\tmapBrightness: config.mapBrightness,
\t\t\tbaseColor: config.baseColor,
\t\t\tmarkerColor: config.markerColor,
\t\t\tglowColor: [0.96, 0.95, 0.92],
\t\t\tmarkers: polaroidMarkers.map(({ id, location }) => ({ id, location, size: config.markerSize }))
\t\t});

\t\tanimate();

\t\treturn () => {
\t\t\twindow.removeEventListener('pointermove', onPointerMove);
\t\t\twindow.removeEventListener('pointerup', onPointerUp);
\t\t\twindow.removeEventListener('pointercancel', onPointerUp);
\t\t\thandlePointerUp();
\t\t\tcancelAnimationFrame(frame);
\t\t\tglobe?.destroy();
\t\t};
\t});
</script>

<div class="globe">
\t<canvas
\t\tbind:this={canvas}
\t\tclass="globe-canvas"
\t\tclass:dragging={isDragging}
\t\tonpointerdown={handlePointerDown}
\t></canvas>

\t{#each polaroidMarkers as marker (marker.id)}
\t\t<div
\t\t\tclass="polaroid"
\t\t\tstyle={\`position-anchor: --cobe-\${marker.id}; --marker-visible: var(--cobe-visible-\${marker.id}, 0); --polaroid-rotate: \${marker.rotate}deg;\`}
\t\t>
\t\t\t<img src={marker.image} alt={marker.caption} />
\t\t\t<span>{marker.caption}</span>
\t\t</div>
\t{/each}
</div>

<style>
\t.globe {
\t\tposition: relative;
\t\twidth: 320px;
\t\theight: 320px;
\t}

\t.globe-canvas {
\t\tdisplay: block;
\t\twidth: 100%;
\t\theight: 100%;
\t\tborder-radius: 9999px;
\t\tcursor: grab;
\t\ttouch-action: none;
\t}

\t.globe-canvas.dragging,
\t.globe-canvas:active {
\t\tcursor: grabbing;
\t}

\t.polaroid {
\t\tposition: absolute;
\t\tbottom: anchor(top);
\t\tleft: anchor(center);
\t\ttranslate: -50% 0;
\t\twidth: 76px;
\t\tpadding: 6px 6px 20px;
\t\tbackground: white;
\t\tbox-shadow: 0 8px 20px rgb(15 23 42 / 0.16);
\t\topacity: var(--marker-visible);
\t\tfilter: blur(calc((1 - var(--marker-visible)) * 10px));
\t\ttransform: rotate(var(--polaroid-rotate, 0deg));
\t\tpointer-events: none;
\t}

\t.polaroid img {
\t\tdisplay: block;
\t\twidth: 100%;
\t\taspect-ratio: 1;
\t\tobject-fit: cover;
\t}

\t.polaroid span {
\t\tposition: absolute;
\t\tright: 6px;
\t\tbottom: 5px;
\t\tleft: 6px;
\t\ttext-align: center;
\t\tfont-size: 0.6rem;
\t\ttext-transform: uppercase;
\t\tletter-spacing: 0.04em;
\t}
</style>`;

export const exampleCode = {
	sticker: stickerCode,
	polaroid: polaroidCode
} as const;
