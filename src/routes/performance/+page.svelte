<script lang="ts">
	import { Highlight } from '$lib/components/ui/highlight';
	import { Code } from '$lib/components/ui/code';

	const mapSamplesCode = `const mapSamples =
\tisMobile ? 8000 :
\tisHeroSection ? 40000 :
\t16000;

const globe = createGlobe(canvas, {
\tmapSamples
});`;

	const intersectionObserverCode = `onMount(() => {
\tif (!canvas) return;

\tobserver = new IntersectionObserver(([entry]) => {
\t\tif (entry?.isIntersecting) start();
\t\telse stop();
\t});

\tobserver.observe(canvas);

\treturn () => {
\t\tobserver?.disconnect();
\t};
});`;

	const devicePixelRatioCode = `const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
const width = Math.round(canvas.clientWidth * devicePixelRatio);
const height = Math.round(canvas.clientHeight * devicePixelRatio);

const globe = createGlobe(canvas, {
\tdevicePixelRatio,
\twidth,
\theight
});`;

	const responsiveCanvasCode = `.globe {
\twidth: min(450px, 100%);
\theight: min(450px, 100vw);
}

@media (max-width: 640px) {
\t.globe {
\t\twidth: clamp(280px, 82vw, 340px);
\t\theight: clamp(280px, 82vw, 340px);
\t}
}`;

	const updateDestroyCode = `let phi = 0;
let frame = 0;

function animate() {
\tphi += 0.005;
\tglobe?.update({ phi });
\tframe = requestAnimationFrame(animate);
}

onDestroy(() => {
\tcancelAnimationFrame(frame);
\tglobe?.destroy();
});`;

	const dynamicImportCode = `async function createGlobeInstance() {
\tif (!canvas || globe) return;

\tconst createGlobe = (await import('cobe')).default;
\tglobe = createGlobe(canvas, config);
}`;

	const performanceLifecycleCode = `<script lang="ts">
\timport type { Globe } from 'cobe';
\timport { onDestroy, onMount } from 'svelte';

\tlet canvas: HTMLCanvasElement | null = null;
\tlet globe: Globe | null = null;
\tlet observer: IntersectionObserver | null = null;
\tlet frame = 0;
\tlet phi = 0;
\tlet isVisible = false;

\tasync function createGlobeInstance() {
\t\tif (!canvas || globe) return;

\t\tconst createGlobe = (await import('cobe')).default;
\t\tglobe = createGlobe(canvas, {
\t\t\tdevicePixelRatio: Math.min(window.devicePixelRatio, 2),
\t\t\twidth: Math.round(canvas.clientWidth * Math.min(window.devicePixelRatio, 2)),
\t\t\theight: Math.round(canvas.clientHeight * Math.min(window.devicePixelRatio, 2)),
\t\t\tphi,
\t\t\ttheta: 0.2,
\t\t\tdark: 0,
\t\t\tdiffuse: 1.2,
\t\t\tmapSamples: 12000
\t\t});
\t}

\tfunction animate() {
\t\tif (!globe) return;

\t\tphi += 0.005;
\t\tglobe.update({ phi });
\t\tframe = requestAnimationFrame(animate);
\t}

\tfunction start() {
\t\tif (frame || !isVisible || document.visibilityState !== 'visible') return;

\t\tvoid createGlobeInstance().then(() => {
\t\t\tif (!frame && globe) animate();
\t\t});
\t}

\tfunction stop({ destroy = false } = {}) {
\t\tif (frame) {
\t\t\tcancelAnimationFrame(frame);
\t\t\tframe = 0;
\t\t}

\t\tif (destroy) {
\t\t\tglobe?.destroy();
\t\t\tglobe = null;
\t\t}
\t}

\tonMount(() => {
\t\tif (!canvas) return;

\t\tconst handleVisibilityChange = () => {
\t\t\tif (document.visibilityState === 'visible') start();
\t\t\telse stop();
\t\t};

\t\tobserver = new IntersectionObserver(([entry]) => {
\t\t\tisVisible = Boolean(entry?.isIntersecting);
\t\t\tif (isVisible) start();
\t\t\telse stop();
\t\t});

\t\tdocument.addEventListener('visibilitychange', handleVisibilityChange);
\t\tobserver.observe(canvas);
\t\tstart();

\t\treturn () => {
\t\t\tdocument.removeEventListener('visibilitychange', handleVisibilityChange);
\t\t};
\t});

\tonDestroy(() => {
\t\tobserver?.disconnect();
\t\tstop({ destroy: true });
\t\tcanvas = null;
\t});
</${'script'}>`;
</script>

<div class="w-full max-w-3xl space-y-10 pb-8">
	<section
		id="performance-overview"
		aria-labelledby="performance-overview-heading"
		class="space-y-3"
	>
		<h1
			id="performance-overview-heading"
			class="font-gp-circle text-3xl text-ink md:text-4xl dark:text-foreground"
		>
			Performance
		</h1>
		<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
			Keep COBE smooth by tuning the expensive parts first, pausing work when the globe is not
			visible, and only rendering the resolution your layout actually needs.
		</p>
	</section>

	<section
		id="expensive-bits"
		aria-labelledby="expensive-bits-heading"
		class="space-y-5 border-t border-dashed border-ink/20 pt-10 dark:border-primary/20"
	>
		<div class="space-y-3">
			<h2
				id="expensive-bits-heading"
				class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
			>
				Tune the expensive bits first
			</h2>
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				For COBE, <Highlight>mapSamples</Highlight> is usually the biggest GPU cost.
			</p>
		</div>

		<div class="space-y-4">
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				Start with <Highlight>8000-16000</Highlight> for most pages, use
				<Highlight>8000</Highlight> on weaker devices, and only push toward
				<Highlight>40000</Highlight> for large hero sections where visual detail matters more than battery
				or scroll smoothness.
			</p>
			<Code name="map-samples.ts" code={mapSamplesCode} />
		</div>
	</section>

	<section
		id="visibility"
		aria-labelledby="visibility-heading"
		class="space-y-5 border-t border-dashed border-ink/20 pt-10 dark:border-primary/20"
	>
		<div class="space-y-3">
			<h2
				id="visibility-heading"
				class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
			>
				Pause work when the globe is hidden
			</h2>
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				The highest-value optimization is usually simple:
				<Highlight>stop requestAnimationFrame when the canvas is off-screen</Highlight>.
			</p>
		</div>

		<div class="space-y-4">
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				Use <Highlight>IntersectionObserver</Highlight> to start animation only when the canvas is visible.
				This matters a lot on docs or marketing pages where several demos may exist below the fold.
			</p>
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				Add <Highlight>document.visibilityState</Highlight> on top of that so background tabs stop animating
				too. Off-screen pause helps scroll performance; tab-hidden pause helps battery and laptop fans.
			</p>
			<Code name="intersection-observer.ts" code={intersectionObserverCode} />
		</div>
	</section>

	<section
		id="resolution"
		aria-labelledby="resolution-heading"
		class="space-y-5 border-t border-dashed border-ink/20 pt-10 dark:border-primary/20"
	>
		<div class="space-y-3">
			<h2
				id="resolution-heading"
				class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
			>
				Control resolution and lifecycle
			</h2>
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				Do not let screen density or unnecessary teardown logic burn GPU time.
			</p>
		</div>

		<div class="space-y-4">
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				Cap <Highlight>devicePixelRatio</Highlight> at <Highlight>2</Highlight> and size the canvas from
				the rendered element, for example
				<Highlight>canvas.clientWidth * devicePixelRatio</Highlight>. That keeps Retina displays
				sharp without letting very dense screens blow up render cost.
			</p>
			<Code name="device-pixel-ratio.ts" code={devicePixelRatioCode} />
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				Only recalculate canvas width and height on a real resize. Do not measure layout every frame
				if the globe size is not changing.
			</p>
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				For mobile layouts, keep the globe around <Highlight>280px to 340px</Highlight> wide so it stays
				clear without forcing excessive canvas area on smaller screens.
			</p>
			<Code name="responsive-globe.css" code={responsiveCanvasCode} />
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				Use <Highlight>globe.update()</Highlight> only for values that actually change, and call
				<Highlight>globe.destroy()</Highlight> when unmounting or swapping scenes so WebGL resources do
				not hang around longer than needed.
			</p>
			<Code name="globe-update-destroy.ts" code={updateDestroyCode} />
		</div>
	</section>

	<section
		id="loading"
		aria-labelledby="loading-heading"
		class="space-y-5 border-t border-dashed border-ink/20 pt-10 dark:border-primary/20"
	>
		<div class="space-y-3">
			<h2
				id="loading-heading"
				class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
			>
				Load less up front
			</h2>
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				If the globe is not needed immediately, delay the library cost too.
			</p>
		</div>

		<div class="space-y-4">
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				Use <Highlight>dynamic import('cobe')</Highlight> when the globe appears inside a preview, tab,
				modal, or below-the-fold section. That keeps your initial JavaScript smaller for users who never
				reach that part of the page.
			</p>
			<Code name="dynamic-import.ts" code={dynamicImportCode} />
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				Also avoid rebuilding <Highlight>markers</Highlight> or <Highlight>arcs</Highlight> arrays on
				every animation tick unless the scene data actually changed. Let rotation animate, but keep the
				rest of the config stable.
			</p>
		</div>
	</section>

	<section
		id="copyable-pattern"
		aria-labelledby="copyable-pattern-heading"
		class="space-y-5 border-t border-dashed border-ink/20 pt-10 dark:border-primary/20"
	>
		<div class="space-y-3">
			<h2
				id="copyable-pattern-heading"
				class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
			>
				Copyable lifecycle pattern
			</h2>
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				This is the one pattern worth copying first:
				<Highlight>lazy init, visibility-aware animation, and full cleanup</Highlight>.
			</p>
		</div>

		<Code name="performance-lifecycle.svelte" code={performanceLifecycleCode} />
	</section>
</div>
