<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import SunMoonIcon from '@lucide/svelte/icons/sun-moon';
	import XIcon from '@lucide/svelte/icons/x';
	import { mode, toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	const sectionLinks = [
		{ href: '/#install', label: 'Install' },
		{ href: '/#usage', label: 'Usage' },
		{ href: '/#examples', label: 'Examples' },
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
		<p class="font-gp-circle text-2xl text-ink">sv-globe</p>

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

		<Separator class="bg-ink/15" />

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
				size="xs"
				class="px-0 text-xs text-muted-foreground"
				onclick={toggleMode}
			>
				<SunMoonIcon />
				{mode.current === 'dark' ? 'Light' : 'Dark'}
			</Button>
		</div>

		<div class="border border-dashed border-ink px-4 py-3 text-sm text-ink">Sponsor my work</div>
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
				aria-expanded={mobileOpen}
				aria-label="Open navigation menu"
				onclick={() => {
					mobileOpen = true;
				}}
			>
				<MenuIcon />
			</Button>
		</div>
	</div>

	{#if mobileOpen}
		<button
			type="button"
			class="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
			aria-label="Close navigation menu"
			onclick={closeMobileMenu}
		></button>

		<div
			class="fixed inset-x-0 bottom-0 z-50 border-t border-ink bg-background px-6 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-16px_40px_-24px_rgba(0,0,0,0.35)] sm:px-8"
		>
			<div class="mx-auto max-w-5xl space-y-5">
				<div class="flex items-center justify-between gap-4">
					<p class="font-gp-circle text-xl text-ink">sv-globe</p>

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

				<Separator class="bg-ink/15" />

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
						size="xs"
						class="px-0 text-xs text-muted-foreground"
						onclick={toggleMode}
					>
						<SunMoonIcon />
						{mode.current === 'dark' ? 'Light' : 'Dark'}
					</Button>
				</div>

				<div class="border border-dashed border-ink px-4 py-3 text-sm text-ink">
					Sponsor my work
				</div>
			</div>
		</div>
	{/if}
</div>
