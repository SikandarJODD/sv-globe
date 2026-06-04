<script lang="ts">
	const exampleItems = [
		'Basic globe setup',
		'Markers and focus states',
		'Auto-rotation and drag controls',
		'Responsive sizing patterns'
	];
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
	</section>

	<!-- <div class="mt-14 space-y-14">
		<section id="install" class="scroll-mt-24 space-y-3">
			<h2 class="font-gp-circle text-2xl text-foreground">Install</h2>
			<p class="max-w-2xl text-sm leading-7 text-muted-foreground">
				Install the package, start the dev server, and keep the first integration small. This layout
				is intentionally minimal.
			</p>
		</section>

		<section id="usage" class="scroll-mt-24 space-y-3">
			<h2 class="font-gp-circle text-2xl text-foreground">Usage</h2>
			<p class="max-w-2xl text-sm leading-7 text-muted-foreground">
				Use the examples as a starting point, then swap in your own markers, themes, and interaction
				settings as needed.
			</p>
		</section>

		<section id="examples" class="scroll-mt-24 space-y-4">
			<h2 class="font-gp-circle text-2xl text-foreground">Examples</h2>
			<ul class="space-y-2 text-sm text-muted-foreground">
				{#each exampleItems as item (item)}
					<li>{item}</li>
				{/each}
			</ul>
		</section>

		<section id="llms" class="scroll-mt-24 space-y-3">
			<h2 class="font-gp-circle text-2xl text-foreground">llms.txt</h2>
			<p class="max-w-2xl text-sm leading-7 text-muted-foreground">
				A minimal machine-readable project summary is available at
				<a href="/llms.txt" class="text-primary underline underline-offset-2">/llms.txt</a>.
			</p>
		</section>
	</div> -->
</div>
