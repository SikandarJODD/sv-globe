<script lang="ts">
	import { Code } from '$lib/components/ui/code';
	import { Highlight } from '$lib/components/ui/highlight';
	import { PMCommand } from '$lib/components/ui/pm-command';
	import Base from '$lib/components/usage/base.svelte';
	import FirstMarker from '$lib/components/usage/first-marker.svelte';
	import SimpleArc from '$lib/components/usage/simple-arc.svelte';
	import { usageCode } from '$lib/components/usage/code';
</script>

<div class="w-full max-w-3xl space-y-10 pb-8">
	<section id="setup-overview" aria-labelledby="setup-overview-heading" class="space-y-3">
		<h1
			id="setup-overview-heading"
			class="font-gp-circle text-3xl text-ink md:text-4xl dark:text-foreground"
		>
			Installation &amp; Setup
		</h1>
		<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
			Install the package, preview the base globe setup, and use the example below as your starting
			point.
		</p>
	</section>

	<section id="installation" aria-labelledby="installation-heading" class="space-y-4">
		<div class="space-y-3">
			<h2
				id="installation-heading"
				class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
			>
				Installation
			</h2>
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				Add <code>cobe</code> with your package manager of choice.
			</p>
		</div>

		<PMCommand variant="secondary" command="install" args={['cobe']} />

		<p class="max-w-2xl font-figtree text-sm leading-7 text-muted-foreground">
			Created by
			<a
				href="https://x.com/shuding"
				target="_blank"
				rel="noreferrer"
				class="text-ink underline underline-offset-3 dark:text-primary"
			>
				Shu Ding
			</a>
			and powered by the original Cobe work.
		</p>
	</section>

	<section
		id="setup-example"
		aria-labelledby="setup-example-heading"
		class="space-y-5 border-t border-dashed border-ink/20 pt-10 dark:border-primary/20"
	>
		<div class="space-y-3">
			<h2
				id="setup-example-heading"
				class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
			>
				Setup
			</h2>
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				This basic example shows the minimal canvas setup and globe configuration.
			</p>
		</div>

		<div class="rounded-lg flex justify-center items-center border border-border bg-card">
			<Base />
		</div>

		<Code name="base.svelte" code={usageCode.base} />
	</section>

	<section
		id="first-marker"
		aria-labelledby="first-marker-heading"
		class="space-y-5 border-t border-dashed border-ink/20 pt-10 dark:border-primary/20"
	>
		<div class="space-y-3">
			<h2
				id="first-marker-heading"
				class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
			>
				Add your first marker
			</h2>
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				Start with one location and add it to the globe through the <Highlight>markers</Highlight>
				array.
			</p>
		</div>

		<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
			Each marker needs a <Highlight>location</Highlight> pair in
			<Highlight>[latitude, longitude]</Highlight> format. You can optionally set a <Highlight
				>size</Highlight
			>
			to make the point easier to see.
		</p>

		<div class="rounded-lg flex items-center justify-center border border-border bg-card">
			<FirstMarker />
		</div>

		<Code name="first-marker.svelte" code={usageCode.firstMarker} />
	</section>

	<section
		id="simple-arc"
		aria-labelledby="simple-arc-heading"
		class="space-y-5 border-t border-dashed border-ink/20 pt-10 dark:border-primary/20"
	>
		<div class="space-y-3">
			<h2
				id="simple-arc-heading"
				class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
			>
				Create an arc
			</h2>
			<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
				Once you have two points, connect them with the <Highlight>arcs</Highlight> array.
			</p>
		</div>

		<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
			Each arc uses a <Highlight>from</Highlight> coordinate and a <Highlight>to</Highlight>
			coordinate. Add <Highlight>arcColor</Highlight> if you want the route line to stand out more clearly.
		</p>

		<div class="rounded-lg flex items-center justify-center border border-border bg-card">
			<SimpleArc />
		</div>

		<Code name="simple-arc.svelte" code={usageCode.simpleArc} />
	</section>
</div>
