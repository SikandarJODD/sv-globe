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

const satellitesCode = `<script lang="ts">
\timport { onDestroy, onMount } from 'svelte';
\timport type { Globe } from 'cobe';
\timport { Spring } from 'svelte/motion';

\tconst config = {
\t\ttheta: 0.2,
\t\tdark: 0.01,
\t\tmapBrightness: 9,
\t\tmarkerColor: [0.9, 0.9, 0.9] as [number, number, number],
\t\tbaseColor: [0.95, 0.95, 0.95] as [number, number, number],
\t\tmarkerSize: 0.03,
\t\tmarkerElevation: 0.15
\t};

\tconst satelliteMarkers = [
\t\t{ id: 'sat-1', location: [45, -120] as [number, number] },
\t\t{ id: 'sat-2', location: [30, 45] as [number, number] },
\t\t{ id: 'sat-3', location: [-15, 100] as [number, number] },
\t\t{ id: 'sat-4', location: [60, -30] as [number, number] },
\t\t{ id: 'sat-5', location: [-40, -60] as [number, number] },
\t\t{ id: 'sat-6', location: [10, 150] as [number, number] },
\t\t{ id: 'sat-7', location: [55, 80] as [number, number] },
\t\t{ id: 'sat-8', location: [-25, 20] as [number, number] }
\t];

\tconst thetaOffsetMin = -0.35;
\tconst thetaOffsetMax = 0.3;

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
\t\tstiffness: 0.11,
\t\tdamping: 0.76,
\t\tprecision: 0.0001
\t});

\tconst thetaOffset = new Spring(0, {
\t\tstiffness: 0.11,
\t\tdamping: 0.76,
\t\tprecision: 0.0001
\t});

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

\t\tif (!isDragging) autoPhi += 0.0027;

\t\tglobe.update({
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

\t\tconst nextPhi = dragStart.phi + (event.clientX - dragStart.x) / 340;
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

\t\tvoid phiOffset.set(phiOffset.target + releaseVelocity.phi * 18);
\t\tvoid thetaOffset.set(
\t\t\tclamp(thetaOffset.target + releaseVelocity.theta * 12, thetaOffsetMin, thetaOffsetMax)
\t\t);

\t\treleaseVelocity = { phi: 0, theta: 0 };
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
\t\t\tdiffuse: 1.45,
\t\t\tmapSamples: 15000,
\t\t\tmapBrightness: config.mapBrightness,
\t\t\tbaseColor: config.baseColor,
\t\t\tmarkerColor: config.markerColor,
\t\t\tglowColor: [0.82, 0.93, 1],
\t\t\tmarkers: satelliteMarkers.map(({ id, location }) => ({
\t\t\t\tid,
\t\t\t\tlocation,
\t\t\t\tsize: config.markerSize
\t\t\t})),
\t\t\tmarkerElevation: config.markerElevation,
\t\t\topacity: 0.92
\t\t});

\t\tanimate();
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

<div class="globe">
\t<canvas
\t\tbind:this={canvas}
\t\tclass="globe-canvas"
\t\tclass:ready={!!globe}
\t\tclass:dragging={isDragging}
\t\tonpointerdown={handlePointerDown}
\t></canvas>

\t{#each satelliteMarkers as marker, index (marker.id)}
\t\t<div
\t\t\tclass="satellite"
\t\t\tstyle={\`position-anchor: --cobe-\${marker.id}; --satellite-visible: var(--cobe-visible-\${marker.id}, 0); --satellite-delay: \${index * 120}ms; --satellite-tilt: \${index % 2 === 0 ? -10 : 10}deg;\`}
\t\t>
\t\t\t<span class="satellite-wave"></span>
\t\t\t<span class="satellite-icon">🛰</span>
\t\t</div>
\t{/each}
</div>

<style>
\t.globe {
\t\tposition: relative;
\t\twidth: min(100%, 26rem);
\t\taspect-ratio: 1;
\t\tuser-select: none;
\t}

\t.globe-canvas {
\t\twidth: 100%;
\t\theight: 100%;
\t\taspect-ratio: 1;
\t\tborder-radius: 9999px;
\t\tcursor: grab;
\t\topacity: 0;
\t\ttouch-action: none;
\t\ttransition: opacity 0.8s ease;
\t}

\t.globe-canvas.ready {
\t\topacity: 1;
\t}

\t.globe-canvas.dragging {
\t\tcursor: grabbing;
\t}

\t.satellite {
\t\tposition: absolute;
\t\tbottom: anchor(top);
\t\tleft: anchor(center);
\t\tdisplay: grid;
\t\twidth: clamp(1.9rem, 1.5rem + 0.8vw, 2.6rem);
\t\tplace-items: center;
\t\taspect-ratio: 1;
\t\ttranslate: -50% 6px;
\t\topacity: var(--satellite-visible);
\t\tfilter: blur(calc((1 - var(--satellite-visible)) * 8px));
\t\ttransform: rotate(var(--satellite-tilt));
\t\ttransition:
\t\t\topacity 0.25s ease,
\t\t\tfilter 0.25s ease;
\t\tpointer-events: none;
\t}

\t.satellite-wave,
\t.satellite-icon {
\t\tgrid-area: 1 / 1;
\t}

\t.satellite-wave {
\t\twidth: 100%;
\t\theight: 100%;
\t\tborder: 1.5px solid rgb(125 211 252 / 0.6);
\t\tborder-radius: 9999px;
\t\tbox-shadow:
\t\t\t0 0 0 1px rgb(255 255 255 / 0.55) inset,
\t\t\t0 0 18px rgb(56 189 248 / 0.25);
\t\tanimation: satellite-ping 2.8s ease-out infinite;
\t\tanimation-delay: var(--satellite-delay);
\t}

\t.satellite-icon {
\t\tfont-size: clamp(1rem, 0.85rem + 0.55vw, 1.45rem);
\t\tline-height: 1;
\t\ttext-shadow:
\t\t\t0 0 12px rgb(125 211 252 / 0.45),
\t\t\t0 3px 8px rgb(15 23 42 / 0.2);
\t}

\t.satellite:nth-child(4n) .satellite-wave {
\t\tanimation-duration: 3.4s;
\t}

\t.satellite:nth-child(5n) .satellite-wave {
\t\tanimation-duration: 2.3s;
\t}

\t@keyframes satellite-ping {
\t\t0% {
\t\t\ttransform: scale(0.72);
\t\t\topacity: 0.9;
\t\t}

\t\t70% {
\t\t\ttransform: scale(1.45);
\t\t\topacity: 0;
\t\t}

\t\t100% {
\t\t\ttransform: scale(1.6);
\t\t\topacity: 0;
\t\t}
\t}
\t
\t@media (max-width: 640px) {
\t\t.satellite {
\t\t\ttranslate: -50% 2px;
\t\t}
\t}
</style>`;

const cdnCode = `<script lang="ts">
\timport createGlobe from 'cobe';
\timport type { Globe } from 'cobe';
\timport { onMount } from 'svelte';
\timport { Spring } from 'svelte/motion';

\tconst config = {
\t\ttheta: 0.2,
\t\tdark: 0,
\t\tmapBrightness: 10,
\t\tmarkerColor: [0, 0, 0] as [number, number, number],
\t\tbaseColor: [1, 1, 1] as [number, number, number],
\t\tarcColor: [0, 0, 0] as [number, number, number],
\t\tmarkerSize: 0.012,
\t\tmarkerElevation: 0.02
\t};
\tconst thetaOffsetMin = -0.32;
\tconst thetaOffsetMax = 0.28;

\tconst cdnMarkers = [
\t\t{ id: 'cdn-iad', location: [38.95, -77.45] as [number, number], region: 'iad1' },
\t\t{ id: 'cdn-sfo', location: [37.62, -122.38] as [number, number], region: 'sfo1' },
\t\t{ id: 'cdn-cdg', location: [49.01, 2.55] as [number, number], region: 'cdg1' },
\t\t{ id: 'cdn-hnd', location: [35.55, 139.78] as [number, number], region: 'hnd1' }
\t];

\tconst cdnArcs = [
\t\t{ id: 'cdn-arc-1', from: [38.95, -77.45] as [number, number], to: [49.01, 2.55] as [number, number], traffic: '2.4 TB/s' },
\t\t{ id: 'cdn-arc-2', from: [37.62, -122.38] as [number, number], to: [35.55, 139.78] as [number, number], traffic: '1.8 TB/s' },
\t\t{ id: 'cdn-arc-3', from: [49.01, 2.55] as [number, number], to: [1.36, 103.99] as [number, number], traffic: '1.2 TB/s' }
\t];

\tlet canvas: HTMLCanvasElement | null = null;
\tlet globe: Globe | null = $state(null);
\tlet frame = 0;
\tlet isDragging = $state(false);
\tlet autoPhi = 0;
\tlet dragStart: { x: number; y: number; phi: number; theta: number } | null = null;
\tlet lastPointer: { x: number; y: number; t: number } | null = null;
\tlet releaseVelocity = { phi: 0, theta: 0 };

\tconst phiOffset = new Spring(0, { stiffness: 0.11, damping: 0.78, precision: 0.0001 });
\tconst thetaOffset = new Spring(0, { stiffness: 0.11, damping: 0.78, precision: 0.0001 });

\tfunction clamp(value: number, min: number, max: number) {
\t\treturn Math.min(max, Math.max(min, value));
\t}

\tfunction animate() {
\t\tif (!isDragging) autoPhi += 0.0028;

\t\tglobe?.update({
\t\t\tphi: autoPhi + phiOffset.current,
\t\t\ttheta: config.theta + thetaOffset.current
\t\t});

\t\tframe = requestAnimationFrame(animate);
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

\t\tconst nextPhi = dragStart.phi + (event.clientX - dragStart.x) / 340;
\t\tconst nextTheta = clamp(
\t\t\tdragStart.theta + (event.clientY - dragStart.y) / 1150,
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

\t\tvoid phiOffset.set(phiOffset.target + releaseVelocity.phi * 18);
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
\t\t\tmapSamples: 14000,
\t\t\tmapBrightness: config.mapBrightness,
\t\t\tbaseColor: config.baseColor,
\t\t\tmarkerColor: config.markerColor,
\t\t\tglowColor: [0.95, 0.95, 0.95],
\t\t\tmarkers: cdnMarkers.map(({ id, location }) => ({ id, location, size: config.markerSize })),
\t\t\tmarkerElevation: config.markerElevation,
\t\t\tarcs: cdnArcs.map(({ id, from, to }) => ({ id, from, to })),
\t\t\tarcColor: config.arcColor,
\t\t\tarcWidth: 0.45,
\t\t\tarcHeight: 0.16
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

\t{#each cdnMarkers as marker (marker.id)}
\t\t<div
\t\t\tclass="cdn-node"
\t\t\tstyle={\`position-anchor: --cobe-\${marker.id}; --marker-visible: var(--cobe-visible-\${marker.id}, 0);\`}
\t\t>
\t\t\t<div class="cdn-pyramid">
\t\t\t\t<div class="cdn-pyramid-face"></div>
\t\t\t\t<div class="cdn-pyramid-face"></div>
\t\t\t\t<div class="cdn-pyramid-face"></div>
\t\t\t\t<div class="cdn-pyramid-face"></div>
\t\t\t</div>
\t\t\t<span>{marker.region}</span>
\t\t</div>
\t{/each}

\t{#each cdnArcs as arc (arc.id)}
\t\t<div
\t\t\tclass="cdn-arc-label"
\t\t\tstyle={\`position-anchor: --cobe-arc-\${arc.id}; --arc-visible: var(--cobe-visible-arc-\${arc.id}, 0);\`}
\t\t>
\t\t\t{arc.traffic}
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

\t.cdn-node {
\t\tposition: absolute;
\t\tbottom: anchor(top);
\t\tleft: anchor(center);
\t\ttranslate: -50% 0;
\t\tdisplay: flex;
\t\tflex-direction: column;
\t\talign-items: center;
\t\tgap: 6px;
\t\topacity: var(--marker-visible);
\t\tfilter: blur(calc((1 - var(--marker-visible)) * 8px));
\t\tpointer-events: none;
\t}

\t.cdn-pyramid {
\t\tposition: relative;
\t\twidth: 12px;
\t\theight: 12px;
\t\ttransform-style: preserve-3d;
\t\tanimation: pyramid-spin 4s linear infinite;
\t}

\t.cdn-pyramid-face {
\t\tposition: absolute;
\t\ttop: 0;
\t\tleft: -0.5px;
\t\twidth: 0;
\t\theight: 0;
\t\tborder-right: 6.5px solid transparent;
\t\tborder-bottom: 13px solid #000;
\t\tborder-left: 6.5px solid transparent;
\t\ttransform-origin: center bottom;
\t}

\t.cdn-pyramid-face:nth-child(1) {
\t\ttransform: rotateY(0deg) translateZ(4px) rotateX(19.5deg);
\t\tborder-bottom-color: #111;
\t}

\t.cdn-pyramid-face:nth-child(2) {
\t\ttransform: rotateY(120deg) translateZ(4px) rotateX(19.5deg);
\t\tborder-bottom-color: #333;
\t}

\t.cdn-pyramid-face:nth-child(3) {
\t\ttransform: rotateY(240deg) translateZ(4px) rotateX(19.5deg);
\t\tborder-bottom-color: #555;
\t}

\t.cdn-pyramid-face:nth-child(4) {
\t\ttransform: rotateX(-90deg) rotateZ(60deg) translateY(4px);
\t\tborder-bottom-color: #222;
\t}

\t.cdn-node span {
\t\tborder-radius: 999px;
\t\tbackground: rgb(255 255 255 / 0.96);
\t\tbox-shadow: 0 6px 18px rgb(15 23 42 / 0.12);
\t\tfont-size: 0.55rem;
\t\tfont-family: monospace;
\t\tletter-spacing: 0.05em;
\t\tpadding: 2px 6px;
\t\twhite-space: nowrap;
\t}

\t.cdn-arc-label {
\t\tposition: absolute;
\t\tbottom: anchor(top);
\t\tleft: anchor(center);
\t\ttranslate: -50% 0;
\t\tborder-radius: 999px;
\t\tbackground: rgb(17 17 17 / 0.94);
\t\tcolor: white;
\t\tfont-size: 0.5rem;
\t\tfont-family: monospace;
\t\tletter-spacing: 0.04em;
\t\topacity: var(--arc-visible);
\t\tfilter: blur(calc((1 - var(--arc-visible)) * 8px));
\t\tpadding: 3px 8px;
\t\tpointer-events: none;
\t\twhite-space: nowrap;
\t}

\t@keyframes pyramid-spin {
\t\t0% { transform: rotateX(20deg) rotateY(0deg); }
\t\t100% { transform: rotateX(20deg) rotateY(360deg); }
\t}
</style>`;

const flightCode = `<script lang="ts">
\timport { onDestroy, onMount } from 'svelte';
\timport type { Globe } from 'cobe';
\timport { Spring } from 'svelte/motion';

\timport { flightArcs, flightMarkers, showcaseConfigs } from './showcase-data';

\tconst config = showcaseConfigs.flights;
\tconst thetaOffsetMin = -0.32;
\tconst thetaOffsetMax = 0.28;
\tconst airportCodeByLocation = new Map(
\t\tflightMarkers.map(({ id, location }) => [location.join(','), id.replace('apt-', '').toUpperCase()])
\t);
\tconst flightRoutes = flightArcs.map((arc) => ({
\t\t...arc,
\t\tlabel:
\t\t\t\`\${airportCodeByLocation.get(arc.from.join(',')) ?? 'UNK'}-\` +
\t\t\t\`\${airportCodeByLocation.get(arc.to.join(',')) ?? 'UNK'}\`
\t}));

\tlet canvas: HTMLCanvasElement | null = null;
\tlet globe: Globe | null = $state(null);
\tlet observer: IntersectionObserver | null = null;
\tlet createGlobePromise: Promise<typeof import('cobe').default> | null = null;
\tlet frame = 0;
\tlet isVisible = false;
\tlet isDragging = $state(false);
\tlet autoPhi = 0;
\tlet dragStart: { x: number; y: number; phi: number; theta: number } | null = null;
\tlet lastPointer: { x: number; y: number; t: number } | null = null;
\tlet releaseVelocity = { phi: 0, theta: 0 };

\tconst phiOffset = new Spring(0, {
\t\tstiffness: 0.11,
\t\tdamping: 0.78,
\t\tprecision: 0.0001
\t});

\tconst thetaOffset = new Spring(0, {
\t\tstiffness: 0.11,
\t\tdamping: 0.78,
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

\t\tif (!isDragging) autoPhi += 0.003;

\t\tglobe.update({
\t\t\tphi: autoPhi + phiOffset.current,
\t\t\ttheta: config.theta + thetaOffset.current
\t\t});

\t\tframe = requestAnimationFrame(animate);
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

\t\tconst nextPhi = dragStart.phi + (event.clientX - dragStart.x) / 340;
\t\tconst nextTheta = clamp(
\t\t\tdragStart.theta + (event.clientY - dragStart.y) / 1150,
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

\t\tvoid phiOffset.set(phiOffset.target + releaseVelocity.phi * 18);
\t\tvoid thetaOffset.set(
\t\t\tclamp(thetaOffset.target + releaseVelocity.theta * 14, thetaOffsetMin, thetaOffsetMax)
\t\t);

\t\treleaseVelocity = { phi: 0, theta: 0 };
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
\t\t\tdiffuse: 1.3,
\t\t\tmapSamples: 15000,
\t\t\tmapBrightness: config.mapBrightness,
\t\t\tbaseColor: config.baseColor,
\t\t\tmarkerColor: config.markerColor,
\t\t\tglowColor: [0.88, 0.93, 1],
\t\t\tmarkers: flightMarkers.map(({ id, location }) => ({
\t\t\t\tid,
\t\t\t\tlocation,
\t\t\t\tsize: config.markerSize
\t\t\t})),
\t\t\tmarkerElevation: config.markerElevation,
\t\t\tarcs: flightRoutes.map(({ from, id, to }) => ({ from, id, to })),
\t\t\tarcColor: config.arcColor,
\t\t\tarcWidth: 0.55,
\t\t\tarcHeight: 0.18,
\t\t\topacity: 0.88
\t\t});

\t\tanimate();
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

<div class="globe">
\t<canvas
\t\tbind:this={canvas}
\t\tclass="globe-canvas"
\t\tclass:ready={!!globe}
\t\tclass:dragging={isDragging}
\t\tonpointerdown={handlePointerDown}
\t></canvas>

\t{#each flightMarkers as marker (marker.id)}
\t\t<div
\t\t\tclass="airport"
\t\t\tstyle={\`position-anchor: --cobe-\${marker.id}; --marker-visible: var(--cobe-visible-\${marker.id}, 0);\`}
\t\t>
\t\t\t<span class="airport-dot"></span>
\t\t\t<span class="airport-label">{marker.id.replace('apt-', '').toUpperCase()}</span>
\t\t</div>
\t{/each}

\t{#each flightRoutes as route, index (route.id)}
\t\t<div
\t\t\tclass="route"
\t\t\tstyle={\`position-anchor: --cobe-arc-\${route.id}; --arc-visible: var(--cobe-visible-arc-\${route.id}, 0); --route-delay: \${index * 160}ms;\`}
\t\t>
\t\t\t<span class="route-plane">AIR</span>
\t\t\t<span class="route-label">{route.label}</span>
\t\t</div>
\t{/each}
</div>

<style>
\t.globe {
\t\tposition: relative;
\t\twidth: min(100%, 32.5rem);
\t\taspect-ratio: 1;
\t\tuser-select: none;
\t}

\t.globe-canvas {
\t\twidth: 100%;
\t\theight: 100%;
\t\taspect-ratio: 1;
\t\tborder-radius: 9999px;
\t\tcursor: grab;
\t\topacity: 0;
\t\ttouch-action: none;
\t\ttransition: opacity 0.8s ease;
\t}

\t.globe-canvas.ready {
\t\topacity: 1;
\t}

\t.globe-canvas.dragging {
\t\tcursor: grabbing;
\t}

\t.airport {
\t\tposition: absolute;
\t\tbottom: anchor(top);
\t\tleft: anchor(center);
\t\tdisplay: inline-flex;
\t\talign-items: center;
\t\tgap: 0.35rem;
\t\ttranslate: -50% 0;
\t\topacity: var(--marker-visible);
\t\tfilter: blur(calc((1 - var(--marker-visible)) * 8px));
\t\ttransition:
\t\t\topacity 0.25s ease,
\t\t\tfilter 0.25s ease;
\t\tpointer-events: none;
\t}

\t.airport-dot {
\t\twidth: 0.45rem;
\t\theight: 0.45rem;
\t\tborder-radius: 9999px;
\t\tbackground: #2563eb;
\t\tbox-shadow: 0 0 0 3px rgb(255 255 255 / 0.8);
\t}

\t.airport-label {
\t\tborder-radius: 9999px;
\t\tbackground: rgb(255 255 255 / 0.95);
\t\tbox-shadow: 0 10px 20px rgb(15 23 42 / 0.12);
\t\tcolor: #0f172a;
\t\tfont-family: monospace;
\t\tfont-size: 0.58rem;
\t\tfont-weight: 600;
\t\tletter-spacing: 0.08em;
\t\tpadding: 0.25rem 0.45rem;
\t}

\t.route {
\t\tposition: absolute;
\t\tbottom: anchor(top);
\t\tleft: anchor(center);
\t\tdisplay: inline-flex;
\t\talign-items: center;
\t\tgap: 0.4rem;
\t\ttranslate: -50% -10%;
\t\tborder-radius: 9999px;
\t\tbackground: linear-gradient(135deg, rgb(15 23 42 / 0.96), rgb(37 99 235 / 0.92));
\t\tbox-shadow: 0 14px 30px rgb(15 23 42 / 0.22);
\t\tcolor: white;
\t\topacity: var(--arc-visible);
\t\tfilter: blur(calc((1 - var(--arc-visible)) * 8px));
\t\tpadding: 0.35rem 0.65rem;
\t\tpointer-events: none;
\t\twhite-space: nowrap;
\t\ttransition:
\t\t\topacity 0.25s ease,
\t\t\tfilter 0.25s ease;
\t\tanimation: flight-float 3.2s ease-in-out infinite;
\t\tanimation-delay: var(--route-delay);
\t}

\t.route-plane {
\t\tdisplay: inline-grid;
\t\twidth: 1.3rem;
\t\theight: 1.3rem;
\t\tplace-items: center;
\t\tborder-radius: 9999px;
\t\tbackground: rgb(255 255 255 / 0.18);
\t\tfont-size: 0.44rem;
\t\tfont-weight: 700;
\t\tletter-spacing: 0.08em;
\t\tline-height: 1;
\t}

\t.route-label {
\t\tfont-family: monospace;
\t\tfont-size: 0.62rem;
\t\tfont-weight: 600;
\t\tletter-spacing: 0.08em;
\t}

\t@keyframes flight-float {
\t\t0%,
\t\t100% { transform: translateY(0); }
\t\t50% { transform: translateY(-5px); }
\t}
</style>`;

const neonGlobeCode = `<script lang="ts">
\timport { onDestroy, onMount } from 'svelte';
\timport type { Globe } from 'cobe';
\timport * as Select from '$lib/components/ui/select';

\tconst regions = [
\t\t{ id: 'us-east-1', label: 'US East 1 (N. Virginia)', code: 'us-east-1', location: [38.95, -77.45] as [number, number] },
\t\t{ id: 'us-east-2', label: 'US East 2 (Ohio)', code: 'us-east-2', location: [39.96, -82.99] as [number, number] },
\t\t{ id: 'us-west-2', label: 'US West 2 (Oregon)', code: 'us-west-2', location: [45.52, -122.68] as [number, number] },
\t\t{ id: 'ap-southeast-1', label: 'Asia Pacific 1 (Singapore)', code: 'ap-southeast-1', location: [1.29, 103.85] as [number, number] },
\t\t{ id: 'ap-southeast-2', label: 'Asia Pacific 2 (Sydney)', code: 'ap-southeast-2', location: [-33.87, 151.21] as [number, number] },
\t\t{ id: 'eu-central-1', label: 'Europe Central 1 (Frankfurt)', code: 'eu-central-1', location: [50.11, 8.68] as [number, number] },
\t\t{ id: 'eu-west-2', label: 'Europe West 2 (London)', code: 'eu-west-2', location: [51.51, -0.13] as [number, number] },
\t\t{ id: 'sa-east-1', label: 'South America East 1 (Sao Paulo)', code: 'sa-east-1', location: [-23.55, -46.63] as [number, number] }
\t];

\tconst activeMarkerColor = [0.35, 0.98, 0.86] as [number, number, number];
\tconst idleMarkerColor = [0.18, 0.56, 0.53] as [number, number, number];

\tlet selectedRegionId = $state('eu-west-2');
\tlet canvas: HTMLCanvasElement | null = null;
\tlet globe: Globe | null = null;
\tlet observer: IntersectionObserver | null = null;
\tlet createGlobePromise: Promise<typeof import('cobe').default> | null = null;
\tlet frame = 0;
\tlet isVisible = false;
\tlet currentPhi = 0;
\tlet currentTheta = 0;
\tlet renderedSize = 0;

\tfunction getSelectedRegion() {
\t\treturn regions.find((region) => region.id === selectedRegionId) ?? regions[0];
\t}

\tfunction locationToAngles(lat: number, long: number) {
\t\treturn [Math.PI - ((long * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180] as const;
\t}

\tfunction normalizeDelta(delta: number) {
\t\treturn Math.atan2(Math.sin(delta), Math.cos(delta));
\t}

\tfunction getMarkers() {
\t\tconst activeRegion = getSelectedRegion();

\t\treturn regions.map((region) => ({
\t\t\tid: region.id,
\t\t\tlocation: region.location,
\t\t\tsize: region.id === activeRegion.id ? 0.09 : 0.038,
\t\t\tcolor: region.id === activeRegion.id ? activeMarkerColor : idleMarkerColor
\t\t}));
\t}

\tfunction syncCanvasSize() {
\t\tif (!canvas) return null;

\t\tconst devicePixelRatio = Math.min(window.devicePixelRatio, 2);
\t\tconst size = Math.max(320, Math.round(canvas.getBoundingClientRect().width * devicePixelRatio));

\t\tif (globe && renderedSize !== size) {
\t\t\tglobe.update({ width: size, height: size, devicePixelRatio });
\t\t}

\t\trenderedSize = size;
\t\treturn { devicePixelRatio, size };
\t}

\tfunction stopAnimation() {
\t\tif (!frame) return;
\t\tcancelAnimationFrame(frame);
\t\tframe = 0;
\t}

\tfunction animate() {
\t\tif (!globe) {
\t\t\tframe = 0;
\t\t\treturn;
\t\t}

\t\tconst time = performance.now();
\t\tconst activeRegion = getSelectedRegion();
\t\tconst [focusPhi, focusTheta] = locationToAngles(...activeRegion.location);
\t\tconst targetPhi = focusPhi + Math.sin(time * 0.00028) * 0.08;
\t\tconst targetTheta = focusTheta + Math.sin(time * 0.0002) * 0.035;

\t\tcurrentPhi += normalizeDelta(targetPhi - currentPhi) * 0.09;
\t\tcurrentTheta += (targetTheta - currentTheta) * 0.08;

\t\tglobe.update({
\t\t\tphi: currentPhi,
\t\t\ttheta: currentTheta,
\t\t\tmarkers: getMarkers()
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

\t\tconst metrics = syncCanvasSize();
\t\tif (!metrics) return;

\t\tconst [initialPhi, initialTheta] = locationToAngles(...getSelectedRegion().location);
\t\tcurrentPhi = initialPhi;
\t\tcurrentTheta = initialTheta;

\t\tconst createGlobe = await getCreateGlobe();
\t\tif (!canvas || globe || !isVisible) return;

\t\tglobe = createGlobe(canvas, {
\t\t\tdevicePixelRatio: metrics.devicePixelRatio,
\t\t\twidth: metrics.size,
\t\t\theight: metrics.size,
\t\t\tphi: currentPhi,
\t\t\ttheta: currentTheta,
\t\t\tdark: 1,
\t\t\tdiffuse: 1.15,
\t\t\tmapSamples: 18000,
\t\t\tmapBrightness: 1.8,
\t\t\tmapBaseBrightness: 0.06,
\t\t\tbaseColor: [0.9, 0.93, 0.95],
\t\t\tmarkerColor: idleMarkerColor,
\t\t\tglowColor: [0.04, 0.25, 0.2],
\t\t\tmarkers: getMarkers(),
\t\t\tmarkerElevation: 0.02,
\t\t\topacity: 0.92
\t\t});

\t\tanimate();
\t}

\tonMount(() => {
\t\tif (!canvas) return;

\t\tconst onResize = () => {
\t\t\tsyncCanvasSize();
\t\t};

\t\twindow.addEventListener('resize', onResize, { passive: true });

\t\tobserver = new IntersectionObserver(
\t\t\t([entry]) => {
\t\t\t\tif (!entry) return;

\t\t\t\tisVisible = entry.isIntersecting;
\t\t\t\tif (isVisible) {
\t\t\t\t\tvoid startGlobe();
\t\t\t\t\treturn;
\t\t\t\t}

\t\t\t\tstopAnimation();
\t\t\t},
\t\t\t{ threshold: 0.18 }
\t\t);

\t\tobserver.observe(canvas);

\t\treturn () => {
\t\t\twindow.removeEventListener('resize', onResize);
\t\t\tobserver?.disconnect();
\t\t\tstopAnimation();
\t\t\tglobe?.destroy();
\t\t};
\t});

\tonDestroy(() => {
\t\tobserver?.disconnect();
\t\tobserver = null;
\t\tisVisible = false;
\t});
</script>

<div class="neon-demo">
\t<div class="neon-controls">
\t\t<Select.Root bind:value={selectedRegionId}>
\t\t\t<Select.Trigger class="neon-trigger w-full justify-between">
\t\t\t\t<span>{getSelectedRegion().label}</span>
\t\t\t</Select.Trigger>
\t\t\t<Select.Content class="border border-[#39f7cb]/20 bg-[#030807]/96 text-white">
\t\t\t\t{#each regions as region (region.id)}
\t\t\t\t\t<Select.Item
\t\t\t\t\t\tvalue={region.id}
\t\t\t\t\t\tlabel={region.label}
\t\t\t\t\t\tclass="text-white/88 data-highlighted:bg-[#0b1715] data-highlighted:text-white"
\t\t\t\t\t>
\t\t\t\t\t\t{region.label}
\t\t\t\t\t</Select.Item>
\t\t\t\t{/each}
\t\t\t</Select.Content>
\t\t</Select.Root>
\t</div>

\t<div class="neon-globe">
\t\t<canvas bind:this={canvas} class="neon-canvas"></canvas>

\t\t<div
\t\t\tclass="neon-card"
\t\t\tstyle={\`position-anchor: --cobe-\${getSelectedRegion().id}; --marker-visible: var(--cobe-visible-\${getSelectedRegion().id}, 0);\`}
\t\t>
\t\t\t<div class="neon-card-kicker">AWS Region</div>
\t\t\t<p class="neon-card-title">{getSelectedRegion().label}</p>
\t\t\t<p class="neon-card-code">{getSelectedRegion().code}</p>
\t\t</div>
\t</div>
</div>

<style>
\t.neon-demo {
\t\twidth: min(100%, 38rem);
\t\tpadding: 1rem;
\t\tborder: 1px solid rgb(57 247 203 / 0.12);
\t\tbackground:
\t\t\tradial-gradient(circle at top, rgb(17 64 56 / 0.48), transparent 42%),
\t\t\tlinear-gradient(180deg, #071110 0%, #040807 55%, #020303 100%);
\t}

\t.neon-controls {
\t\tmargin-bottom: 1rem;
\t}

\t.neon-trigger {
\t\theight: 2.75rem;
\t\tborder-color: rgb(57 247 203 / 0.22);
\t\tbackground: rgb(1 8 7 / 0.72);
\t\tcolor: rgb(246 252 251 / 0.94);
\t}

\t.neon-globe {
\t\tposition: relative;
\t\twidth: min(100%, 26rem);
\t\tmargin-inline: auto;
\t\taspect-ratio: 1;
\t}

\t.neon-canvas {
\t\twidth: 100%;
\t\theight: 100%;
\t\tborder-radius: 9999px;
\t}

\t.neon-card {
\t\tposition: absolute;
\t\tbottom: anchor(top);
\t\tleft: anchor(center);
\t\ttranslate: -50% 0;
\t\twidth: min(16rem, calc(100vw - 5rem));
\t\tpadding: 0.9rem 1rem;
\t\tborder: 1px solid rgb(57 247 203 / 0.85);
\t\tbackground: linear-gradient(180deg, rgb(5 12 10 / 0.96), rgb(3 8 7 / 0.92));
\t\tbox-shadow:
\t\t\t0 0 0 1px rgb(57 247 203 / 0.08),
\t\t\t0 0 24px rgb(57 247 203 / 0.16),
\t\t\t0 18px 36px rgb(0 0 0 / 0.28);
\t\topacity: var(--marker-visible, 0);
\t\tfilter: blur(calc((1 - var(--marker-visible, 0)) * 8px));
\t\ttransition:
\t\t\topacity 0.24s ease,
\t\t\tfilter 0.24s ease;
\t\tpointer-events: none;
\t}

\t.neon-card-kicker {
\t\tmargin-bottom: 0.55rem;
\t\tfont-size: 0.78rem;
\t\tfont-weight: 600;
\t\tcolor: rgb(208 220 216 / 0.76);
\t}

\t.neon-card-title {
\t\tmargin: 0;
\t\tfont-size: 1.05rem;
\t\tfont-weight: 700;
\t\tline-height: 1.3;
\t\tcolor: white;
\t}

\t.neon-card-code {
\t\tmargin: 0.55rem 0 0;
\t\tfont-family: monospace;
\t\tfont-size: 0.75rem;
\t\tletter-spacing: 0.12em;
\t\ttext-transform: uppercase;
\t\tcolor: rgb(136 245 221 / 0.78);
\t}
</style>`;

export const exampleCode = {
	sticker: stickerCode,
	polaroid: polaroidCode,
	satellites: satellitesCode,
	cdn: cdnCode,
	flight: flightCode,
	neonGlobe: neonGlobeCode
} as const;
