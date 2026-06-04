const baseCode = `<script lang="ts">
\timport createGlobe from 'cobe';
\timport type { Globe } from 'cobe';
\timport { onMount } from 'svelte';

\tlet canvas: HTMLCanvasElement | null = null;
\tlet globe: Globe | null = null;
\tlet phi = 0;
\tlet frame = 0;

\tfunction animate() {
\t\tphi += 0.005;
\t\tglobe?.update({ phi });
\t\tframe = requestAnimationFrame(animate);
\t}

\tonMount(() => {
\t\tif (!canvas) return;

\t\tglobe = createGlobe(canvas, {
\t\t\tdevicePixelRatio: Math.min(window.devicePixelRatio, 2),
\t\t\twidth: 300,
\t\t\theight: 300,
\t\t\tphi: 0,
\t\t\ttheta: 0.2,
\t\t\tdark: 0,
\t\t\tdiffuse: 1.2,
\t\t\tmapSamples: 13000,
\t\t\tmapBrightness: 6,
\t\t\tbaseColor: [1, 1, 1],
\t\t\tmarkerColor: [0.2, 0.4, 1],
\t\t\tglowColor: [1, 1, 1],
\t\t\tmarkers: [
\t\t\t\t{ location: [37.78, -122.44], size: 0.03, id: 'sf' },
\t\t\t\t{ location: [40.71, -74.01], size: 0.03, id: 'nyc' }
\t\t\t],
\t\t\tarcs: [{ from: [37.78, -122.44], to: [40.71, -74.01] }],
\t\t\tarcColor: [0.3, 0.5, 1],
\t\t\tarcWidth: 0.5,
\t\t\tarcHeight: 0.3
\t\t});

\t\tanimate();

\t\treturn () => {
\t\t\tcancelAnimationFrame(frame);
\t\t\tglobe?.destroy();
\t\t};
\t});
</script>

<div class="globe">
\t<canvas bind:this={canvas} class="globe-canvas"></canvas>
</div>

<style>
\t.globe {
\t\twidth: 300px;
\t\theight: 300px;
\t}

\t.globe-canvas {
\t\tdisplay: block;
\t\twidth: 100%;
\t\theight: 100%;
\t}
</style>
`;

const basicCode = `<script lang="ts">
\timport createGlobe from 'cobe';
\timport type { Globe } from 'cobe';
\timport { onMount } from 'svelte';

\tlet canvas: HTMLCanvasElement | null = null;
\tlet globe: Globe | null = null;

\tonMount(() => {
\t\tif (!canvas) return;

\t\tglobe = createGlobe(canvas, {
\t\t\tdevicePixelRatio: Math.min(window.devicePixelRatio, 2),
\t\t\twidth: 200,
\t\t\theight: 200,
\t\t\tphi: 0,
\t\t\ttheta: 0.2,
\t\t\tdark: 0,
\t\t\tdiffuse: 1.2,
\t\t\tmapSamples: 16000,
\t\t\tmapBrightness: 6,
\t\t\tbaseColor: [1, 1, 1],
\t\t\tmarkerColor: [0.2, 0.4, 1],
\t\t\tglowColor: [1, 1, 1]
\t\t});

\t\treturn () => globe?.destroy();
\t});
</script>

<div class="globe">
\t<canvas bind:this={canvas} class="globe-canvas"></canvas>
</div>
`;

const cssAnchorCode = `<script lang="ts">
\timport createGlobe from 'cobe';
\timport type { Globe } from 'cobe';
\timport { onMount } from 'svelte';

\tconst markers = [
\t\t{ id: 'sf', location: [37.78, -122.44] as [number, number], label: 'San Francisco' },
\t\t{ id: 'nyc', location: [40.71, -74.01] as [number, number], label: 'New York' }
\t];

\tlet canvas: HTMLCanvasElement | null = null;
\tlet globe: Globe | null = null;
\tlet phi = 0;
\tlet frame = 0;

\tfunction animate() {
\t\tphi += 0.005;
\t\tglobe?.update({ phi });
\t\tframe = requestAnimationFrame(animate);
\t}

\tonMount(() => {
\t\tif (!canvas) return;

\t\tglobe = createGlobe(canvas, {
\t\t\tdevicePixelRatio: Math.min(window.devicePixelRatio, 2),
\t\t\twidth: 300,
\t\t\theight: 300,
\t\t\tphi: 0,
\t\t\ttheta: 0.2,
\t\t\tdark: 0,
\t\t\tdiffuse: 1.2,
\t\t\tmapSamples: 13000,
\t\t\tmapBrightness: 6,
\t\t\tbaseColor: [1, 1, 1],
\t\t\tmarkerColor: [0.2, 0.4, 1],
\t\t\tglowColor: [1, 1, 1],
\t\t\tmarkers: markers.map(({ id, location }) => ({ id, location, size: 0.03 }))
\t\t});

\t\tanimate();

\t\treturn () => {
\t\t\tcancelAnimationFrame(frame);
\t\t\tglobe?.destroy();
\t\t};
\t});
</script>

<div class="globe">
\t<canvas bind:this={canvas} class="globe-canvas"></canvas>
\t{#each markers as marker (marker.id)}
\t\t<div
\t\t\tclass="marker-label"
\t\t\tstyle={\`position-anchor: --cobe-\${marker.id}; --marker-visible: var(--cobe-visible-\${marker.id}, 0);\`}
\t\t>
\t\t\t{marker.label}
\t\t</div>
\t{/each}
</div>
`;

const draggableCode = `<script lang="ts">
\timport createGlobe from 'cobe';
\timport type { Globe } from 'cobe';
\timport { Spring } from 'svelte/motion';
\timport { onMount } from 'svelte';

\tconst size = 300;
\tconst baseTheta = 0.2;

\tlet canvas: HTMLCanvasElement | null = null;
\tlet globe: Globe | null = null;
\tlet isDragging = $state(false);
\tlet frame = 0;
\tlet autoPhi = 0;

\tconst phiOffset = new Spring(0);
\tconst thetaOffset = new Spring(0);

\tfunction handlePointerDown() {
\t\tisDragging = true;
\t}

\tfunction handlePointerUp() {
\t\tisDragging = false;
\t}

\tfunction animate() {
\t\tif (!isDragging) autoPhi += 0.005;

\t\tglobe?.update({
\t\t\tphi: autoPhi + phiOffset.current,
\t\t\ttheta: baseTheta + thetaOffset.current
\t\t});

\t\tframe = requestAnimationFrame(animate);
\t}

\tonMount(() => {
\t\tif (!canvas) return;

\t\tglobe = createGlobe(canvas, {
\t\t\tdevicePixelRatio: Math.min(window.devicePixelRatio, 2),
\t\t\twidth: size,
\t\t\theight: size,
\t\t\tphi: 0,
\t\t\ttheta: baseTheta,
\t\t\tdark: 0,
\t\t\tdiffuse: 1.2,
\t\t\tmapSamples: 16000,
\t\t\tmapBrightness: 6,
\t\t\tbaseColor: [1, 1, 1],
\t\t\tmarkerColor: [0.2, 0.4, 1],
\t\t\tglowColor: [1, 1, 1]
\t\t});

\t\tanimate();

\t\treturn () => {
\t\t\tcancelAnimationFrame(frame);
\t\t\tglobe?.destroy();
\t\t};
\t});
</script>

<div class="globe">
\t<canvas
\t\tbind:this={canvas}
\t\tclass:dragging={isDragging}
\t\tonpointerdown={handlePointerDown}
\t\tonpointerup={handlePointerUp}
\t></canvas>
</div>
`;

const focusLocationCode = `<script lang="ts">
\timport createGlobe from 'cobe';
\timport type { Globe } from 'cobe';
\timport { onMount } from 'svelte';

\tconst locations = [
\t\t{ id: 'nyc', label: 'New York', location: [40.71, -74.01] as [number, number] },
\t\t{ id: 'ldn', label: 'London', location: [51.5, -0.12] as [number, number] },
\t\t{ id: 'tok', label: 'Tokyo', location: [35.68, 139.65] as [number, number] }
\t];

\tlet canvas: HTMLCanvasElement | null = null;
\tlet globe: Globe | null = null;
\tlet frame = 0;
\tlet phi = 0;
\tlet theta = 0.2;
\tlet activeLocationId = $state('tok');

\tfunction locationToAngles(lat: number, long: number) {
\t\treturn [Math.PI - ((long * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];
\t}

\tfunction animate() {
\t\tconst active = locations.find((location) => location.id === activeLocationId) ?? locations[0];
\t\tconst [targetPhi, targetTheta] = locationToAngles(...active.location);

\t\tphi += (targetPhi - phi) * 0.08;
\t\ttheta += (targetTheta - theta) * 0.08;

\t\tglobe?.update({
\t\t\tphi,
\t\t\ttheta,
\t\t\tmarkers: locations.map((location) => ({
\t\t\t\tid: location.id,
\t\t\t\tlocation: location.location,
\t\t\t\tsize: location.id === activeLocationId ? 0.055 : 0.035
\t\t\t}))
\t\t});

\t\tframe = requestAnimationFrame(animate);
\t}

\tonMount(() => {
\t\tif (!canvas) return;

\t\tconst [initialPhi, initialTheta] = locationToAngles(...locations[2].location);
\t\tphi = initialPhi;
\t\ttheta = initialTheta;

\t\tglobe = createGlobe(canvas, {
\t\t\tdevicePixelRatio: Math.min(window.devicePixelRatio, 2),
\t\t\twidth: 300,
\t\t\theight: 300,
\t\t\tphi,
\t\t\ttheta,
\t\t\tdark: 0,
\t\t\tdiffuse: 1.2,
\t\t\tmapSamples: 13000,
\t\t\tmapBrightness: 6,
\t\t\tbaseColor: [1, 1, 1],
\t\t\tmarkerColor: [0.2, 0.4, 1],
\t\t\tglowColor: [1, 1, 1]
\t\t});

\t\tanimate();

\t\treturn () => {
\t\t\tcancelAnimationFrame(frame);
\t\t\tglobe?.destroy();
\t\t};
\t});
</script>
`;

const performanceCode = `<script lang="ts">
\timport createGlobe from 'cobe';
\timport type { Globe } from 'cobe';
\timport { onMount } from 'svelte';

\tlet canvas: HTMLCanvasElement | null = null;
\tlet globe: Globe | null = null;
\tlet observer: IntersectionObserver | null = null;
\tlet frame = 0;
\tlet phi = 0;

\tfunction animate() {
\t\tphi += 0.005;
\t\tglobe?.update({ phi });
\t\tframe = requestAnimationFrame(animate);
\t}

\tfunction start() {
\t\tif (frame || !globe) return;
\t\tanimate();
\t}

\tfunction stop() {
\t\tcancelAnimationFrame(frame);
\t\tframe = 0;
\t}

\tonMount(() => {
\t\tif (!canvas) return;

\t\tglobe = createGlobe(canvas, {
\t\t\tdevicePixelRatio: Math.min(window.devicePixelRatio, 2),
\t\t\twidth: 300,
\t\t\theight: 300,
\t\t\tphi: 0,
\t\t\ttheta: 0.2,
\t\t\tdark: 0,
\t\t\tdiffuse: 1.2,
\t\t\tmapSamples: 12000,
\t\t\tmapBrightness: 6,
\t\t\tbaseColor: [1, 1, 1],
\t\t\tmarkerColor: [0.2, 0.4, 1],
\t\t\tglowColor: [1, 1, 1]
\t\t});

\t\tobserver = new IntersectionObserver(([entry]) => {
\t\t\tif (entry?.isIntersecting) start();
\t\t\telse stop();
\t\t});

\t\tobserver.observe(canvas);

\t\treturn () => {
\t\t\tobserver?.disconnect();
\t\t\tstop();
\t\t\tglobe?.destroy();
\t\t};
\t});
</script>
`;

export const usageCode = {
	base: baseCode,
	basic: basicCode,
	cssAnchor: cssAnchorCode,
	draggable: draggableCode,
	focusLocation: focusLocationCode,
	performance: performanceCode
} as const;
