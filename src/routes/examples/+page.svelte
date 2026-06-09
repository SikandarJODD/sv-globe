<script lang="ts">
	import { PreviewComponent } from '$lib/components/ui/preview-component';
	import { exampleItems } from '$lib/components/example/example';

	function getExampleId(name: string) {
		return `example-${name.replace('.svelte', '')}`;
	}
</script>

<div class="w-full max-w-3xl space-y-10 pb-8">
	<section id="examples-overview" aria-labelledby="examples-overview-heading" class="space-y-3">
		<h1
			id="examples-overview-heading"
			class="font-gp-circle text-3xl text-ink md:text-4xl dark:text-foreground"
		>
			Examples
		</h1>
		<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
			Preview complete globe compositions and reuse the source when you want more than the basic
			usage patterns.
		</p>
	</section>

	{#each exampleItems as item, index (item.name)}
		<section
			id={getExampleId(item.name)}
			aria-labelledby={`${getExampleId(item.name)}-heading`}
			class={`space-y-5 ${index > 0 ? 'border-t border-dashed border-ink/20 pt-10 dark:border-primary/20' : ''}`}
		>
			<div class="space-y-3">
				<h2
					id={`${getExampleId(item.name)}-heading`}
					class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
				>
					{item.title}
				</h2>
				<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
					{item.desc}
				</p>
			</div>

			<PreviewComponent code={{ name: item.name, code: item.code, title: item.title }}>
				{#snippet children()}
					<item.preview />
				{/snippet}
			</PreviewComponent>
		</section>
	{/each}
</div>
