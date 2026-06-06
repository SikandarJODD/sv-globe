<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import SponsorButton from './sponsor-button.svelte';
	import ThemeButton from './theme-button.svelte';
	import type { NavItem } from './nav';

	interface Props {
		title: string;
		items: NavItem[];
		githubLink: string;
		sponsorLink: string;
	}

	let { title, items, githubLink, sponsorLink }: Props = $props();
</script>

<nav
	aria-label="Page navigation"
	class="hidden w-full max-w-56 text-center lg:sticky lg:top-12.5 lg:block lg:text-left"
>
	<div class="flex flex-col gap-5">
		<a href="/" class="font-gp-circle text-2xl text-ink dark:text-primary">{title}</a>

		<div class="space-y-2">
			{#each items as item (item.href)}
				<a
					href={item.href}
					class="block text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
				>
					{item.label}
				</a>
			{/each}
		</div>

		<Separator class="bg-ink/15 dark:bg-secondary" />

		<div class="flex items-center justify-between gap-4">
			<a
				href={githubLink}
				target="_blank"
				rel="noreferrer"
				class="text-sm text-ink px-2 py-1 border border-ink/40 dark:border-primary/30 dark:text-primary border-dashed"
			>
				Github
			</a>

			<ThemeButton class="rounded-sm" />
		</div>

		<SponsorButton
			href={sponsorLink}
			class="border border-dashed border-ink/40 bg-ink-dim/30 px-4 py-2.5 text-xs text-ink transition-all -mt-2.5 duration-200 dark:border-primary/30 dark:bg-card dark:text-primary dark:hover:bg-card/80"
		/>
	</div>
</nav>
