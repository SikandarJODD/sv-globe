<script lang="ts">
	import { Code } from '$lib/components/ui/code';
	import { PMCommand } from '$lib/components/ui/pm-command';
	import Base from '$lib/components/usage/base.svelte';
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

		<PMCommand variant='secondary' command="install" args={['cobe']} />

		<p class="max-w-2xl font-figtree text-sm leading-7 text-muted-foreground">
			Created by
			<a
				href="https://x.com/shuding"
				target="_blank"
				rel="noreferrer"
				class="text-ink underline underline-offset-3 dark:text-primary"
			>
				Shu
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
</div>
