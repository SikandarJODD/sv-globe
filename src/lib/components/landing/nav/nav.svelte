<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import XIcon from '@lucide/svelte/icons/x';
	import { mode, toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	const sectionLinks = [
		{ href: '/#goal', label: 'Goal' },
		{ href: '/#credits', label: 'Credits' },
		{ href: '/llms.txt', label: 'llms.txt' }
	];

	const githubLink = 'https://github.com/SikandarJODD/sv-globe';

	let mobileOpen = $state(false);

	const closeMobileMenu = () => {
		mobileOpen = false;
	};
</script>

<nav
	aria-label="Page navigation"
	class="hidden w-full max-w-56 text-center lg:sticky lg:top-12 lg:block lg:text-left"
>
	<div class="flex flex-col gap-5">
		<p class="font-gp-circle text-2xl text-ink dark:text-primary">sv-globe</p>

		<div class="space-y-2">
			{#each sectionLinks as link (link.href)}
				<a
					href={link.href}
					class="block text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
				>
					{link.label}
				</a>
			{/each}
		</div>

		<Separator class="bg-ink/15 dark:bg-secondary" />

		<div class="flex items-center justify-between gap-4">
			<a
				href={githubLink}
				target="_blank"
				rel="noreferrer"
				class="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
			>
				Github
			</a>

			<Button
				variant="ghost"
				size="icon-sm"
				class="rounded-sm text-muted-foreground"
				aria-label={`Switch to ${mode.current === 'dark' ? 'light' : 'dark'} mode`}
				onclick={toggleMode}
			>
				{#if mode.current === 'light'}
					<MoonIcon />
				{:else}
					<SunIcon />
				{/if}
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>

		<a
			href="https://github.com/sponsors/SikandarJODD"
			target="_blank"
			rel="noreferrer"
			class="border border-dashed border-ink/40 px-4 py-2.5 text-xs text-ink transition-all duration-200 dark:border-primary/30 bg-ink-dim/30 dark:bg-card dark:text-primary dark:hover:bg-card/80"
		>
			Sponsor my work
		</a>
	</div>
</nav>

<div class="lg:hidden">
	<div
		class="fixed inset-x-0 bottom-0 z-40 border-t border-ink/15 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
	>
		<div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-8">
			<p class="font-gp-circle text-lg text-ink">sv-globe</p>

			<Button
				variant="ghost"
				size="icon-sm"
				class="text-foreground"
				aria-label="Open navigation menu"
				onclick={() => {
					mobileOpen = true;
				}}
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
					<p class="font-gp-circle text-xl text-ink dark:text-primary">sv-globe</p>

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
					{#each sectionLinks as link (link.href)}
						<a
							href={link.href}
							class="block text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
							onclick={closeMobileMenu}
						>
							{link.label}
						</a>
					{/each}
				</div>

				<Separator class="bg-ink/15 dark:bg-secondary" />

				<div class="flex items-center justify-between gap-4">
					<a
						href={githubLink}
						target="_blank"
						rel="noreferrer"
						class="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
					>
						Github
					</a>

					<Button
						variant="ghost"
						size="icon-sm"
						class="text-muted-foreground"
						aria-label={`Switch to ${mode.current === 'dark' ? 'light' : 'dark'} mode`}
						onclick={toggleMode}
					>
						{#if mode.current === 'light'}
							<MoonIcon />
						{:else}
							<SunIcon />
						{/if}
						<span class="sr-only">Toggle theme</span>
					</Button>
				</div>

				<a
					href="https://github.com/sponsors/SikandarJODD"
					target="_blank"
					rel="noreferrer"
					class="border border-dashed border-ink px-4 py-3 text-sm text-ink dark:border-primary/30 dark:text-primary"
				>
					Sponsor my work
				</a>
			</div>
		</Drawer.DrawerContent>
	</Drawer.Drawer>
</div>
