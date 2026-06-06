<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import SponsorDropdown from './sponsor-dropdown.svelte';
	import ThemeButton from './theme-button.svelte';
	import type { NavItem } from './nav';

	interface Props {
		title: string;
		items: NavItem[];
		githubLink: string;
		sponsorLink: string;
		polarCheckoutLink: string;
	}

	let { title, items, githubLink, sponsorLink, polarCheckoutLink }: Props = $props();
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
				GitHub
			</a>

			<ThemeButton class="rounded-sm" />
		</div>

		<SponsorDropdown githubSponsorLink={sponsorLink} {polarCheckoutLink} class="-mt-2.5" />
	</div>
</nav>
