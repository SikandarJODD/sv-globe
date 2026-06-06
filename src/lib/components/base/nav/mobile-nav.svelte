<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import XIcon from '@lucide/svelte/icons/x';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
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

	let mobileOpen = $state(false);

	const openMobileMenu = () => {
		mobileOpen = true;
	};

	const closeMobileMenu = () => {
		mobileOpen = false;
	};
</script>

<div class="lg:hidden">
	<div
		class="fixed inset-x-0 bottom-0 z-40 border-t border-ink/15 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
	>
		<div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-8">
			<p class="font-gp-circle text-lg text-ink">{title}</p>

			<Button
				variant="ghost"
				size="icon-sm"
				class="text-foreground"
				aria-label="Open navigation menu"
				onclick={openMobileMenu}
			>
				<MenuIcon />
			</Button>
		</div>
	</div>

	<Drawer.Drawer bind:open={mobileOpen} direction="bottom">
		<Drawer.DrawerContent
			class="bg-background px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-8"
		>
			<div class="w-full space-y-5">
				<div class="flex items-center justify-between gap-4">
					<p class="font-gp-circle text-xl text-ink dark:text-primary">{title}</p>

					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Close navigation menu"
						onclick={closeMobileMenu}
					>
						<XIcon />
					</Button>
				</div>

				<div class="space-y-3">
					{#each items as item (item.href)}
						<a
							href={item.href}
							class="block text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
							onclick={closeMobileMenu}
						>
							{item.label}
						</a>
					{/each}
				</div>

				<Separator class="bg-ink/15 dark:bg-secondary" />

				<div class="flex w-full items-center justify-between gap-4">
					<a
						href={githubLink}
						target="_blank"
						rel="noreferrer"
						class="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
					>
						Github
					</a>

					<ThemeButton />
				</div>

				<div class="w-full flex text-center">
					<SponsorButton
						href={sponsorLink}
						class="min-w-full border border-dashed border-ink px-4 py-3 text-sm text-ink dark:border-primary/30 dark:text-primary"
					/>
				</div>
			</div>
		</Drawer.DrawerContent>
	</Drawer.Drawer>
</div>
