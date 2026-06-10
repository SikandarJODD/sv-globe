<script>
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<div class="w-full max-w-3xl text-center lg:text-left">
	<section class="space-y-6">
		<h1
			class="bg-linear-to-b from-blue-500 from-20% to-ink bg-clip-text font-gp-circle text-5xl text-balance text-transparent md:text-6xl xl:text-5xl dark:from-white dark:to-neutral-600"
		>
			Svelte Globe Examples
		</h1>
		<p class="max-w-3xl font-figtree text-lg text-balance text-muted-foreground">
			Setup guides and example patterns for building 3D globe interfaces in Svelte.
			<br />
			Powered by
			<a
				href="https://cobe.vercel.app"
				target="_blank"
				rel="noreferrer"
				class="text-ink dark:text-primary underline underline-offset-2"
			>
				Cobe
			</a>.
		</p>

		<div
			class="flex flex-col items-center gap-2.5 pt-2 sm:flex-row sm:justify-center lg:justify-start"
		>
			<Button size="lg" class="bg-ink hover:bg-ink/80! dark:hover:bg-primary/80! border border-ink dark:border-primary dark:bg-primary font-gp" href="/setup">Get Started</Button>
			<Button size="lg" variant="outline" class="font-gp border-ink border-dashed text-ink dark:text-primary hover:bg-ink-dim hover:text-ink/90" href="/examples">View Examples</Button>
		</div>
	</section>
</div>
