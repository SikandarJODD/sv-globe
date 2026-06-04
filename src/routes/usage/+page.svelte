<script lang="ts">
	import { PreviewComponent } from '$lib/components/ui/preview-component';
	import { usageItems } from './usage';

	function getUsageId(name: string) {
		return `usage-${name.replace('.svelte', '')}`;
	}
</script>

<div class="w-full max-w-3xl space-y-10 pb-8">
	<section id="usage-overview" aria-labelledby="usage-overview-heading" class="space-y-3">
		<h1
			id="usage-overview-heading"
			class="font-gp-circle text-3xl text-ink md:text-4xl dark:text-foreground"
		>
			Usage
		</h1>
		<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
			Explore the core globe patterns, compare their source, and reuse the example that best fits
			your interaction or performance needs.
		</p>
	</section>

	{#each usageItems as item, index (item.name)}
		<section
			id={getUsageId(item.name)}
			aria-labelledby={`${getUsageId(item.name)}-heading`}
			class={`space-y-5 ${index > 0 ? 'border-t border-dashed border-ink/20 pt-10 dark:border-primary/20' : ''}`}
		>
			<div class="space-y-3">
				<h2
					id={`${getUsageId(item.name)}-heading`}
					class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
				>
					{item.title}
				</h2>
				<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
					{item.desc}
				</p>
			</div>

			<PreviewComponent code={{ name: item.name, code: item.code }}>
				{#snippet children()}
					<item.preview />
				{/snippet}
			</PreviewComponent>
		</section>
	{/each}
</div>
