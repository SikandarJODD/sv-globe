<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	// import SmileIcon from '@lucide/svelte/icons/smile';
	import githubLogo from '$lib/assets/github.svelte';
	import polarLogo from '$lib/assets/polar.svelte';
	// import { QRCode } from '$lib/components/spell/qrcode/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { cn } from '$lib/utils';
	import type { Component } from 'svelte';
	import { PUBLIC_UPI_LINK } from '$env/static/public';

	type SponsorLinkOption = {
		key: 'polar' | 'github';
		label: string;
		href: string;
		logo: Component;
	};

	interface Props {
		githubSponsorLink: string;
		polarCheckoutLink: string;
		class?: string;
		label?: string;
	}

	let {
		githubSponsorLink,
		polarCheckoutLink,
		class: className = '',
		label = 'Sponsor my work'
	}: Props = $props();

	let open = $state(false);

	let upiLink = $derived(PUBLIC_UPI_LINK);

	let sponsorOptions: SponsorLinkOption[] = $derived([
		{ key: 'polar', label: 'Polar', href: polarCheckoutLink, logo: polarLogo },
		{ key: 'github', label: 'GitHub', href: githubSponsorLink, logo: githubLogo }
	]);

	let closeMenu = () => {
		open = false;
	};
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger
		class={cn(
			'flex w-full items-center justify-between gap-3 border border-dashed border-ink/40 bg-ink-dim/30 px-4 py-2.5 text-xs text-ink transition-colors duration-200 outline-none hover:bg-ink-dim/45 focus-visible:ring-1 focus-visible:ring-ink/30 dark:border-primary/30 dark:bg-card dark:text-primary dark:hover:bg-card/80 dark:focus-visible:ring-primary/30',
			className
		)}
	>
		<span>{label}</span>
		<ChevronDownIcon
			class={cn('size-3.5 shrink-0 transition-all duration-200', open && 'rotate-180')}
		/>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content
		sideOffset={8}
		preventScroll={false}
		interactOutsideBehavior='ignore'
		class="w-56 border border-dashed border-ink/40 bg-background p-1 text-ink shadow-none dark:border-primary/30 dark:bg-card dark:text-primary"
	>
		<div class="flex flex-col gap-1">
			<div class="grid grid-cols-2 gap-1">
				{#each sponsorOptions as option (option.key)}
					{const Icon = option.logo}
					<a
						href={option.href}
						class="flex items-center gap-3 border border-transparent px-3 py-2 text-xs text-ink transition-colors duration-200 hover:bg-ink-dim/45 focus-visible:bg-ink-dim/45 focus-visible:outline-none dark:text-primary dark:hover:bg-primary/8 dark:focus-visible:bg-primary/8"
						target={option.key === 'github' ? '_blank' : undefined}
						rel={option.key === 'github' ? 'noreferrer' : undefined}
						data-polar-checkout={option.key === 'polar' ? true : undefined}
						data-polar-checkout-theme={option.key === 'polar' ? 'dark' : undefined}
						onclick={closeMenu}
					>
						<Icon class="size-3" aria-hidden="true" />
						<span>{option.label}</span>
					</a>
				{/each}
			</div>
			<!-- <div class="border-t border-dashed border-ink/20 pt-1 dark:border-primary/20">
				<div
					class="sponsor-qr-panel relative border border-dashed border-ink/30 bg-ink-dim/20 p-3 dark:border-primary/30 dark:bg-teal-900/10"
				>
					<div class="mb-2 flex items-center justify-between gap-2">
						<span class="text-xs uppercase tracking-[0.18em] text-ink/70 dark:text-primary/70">
							QR Code
						</span>
						<a
							href={upiLink}
							class="text-[10px] font-mono text-ink/70 transition-colors hover:text-ink dark:text-primary/70 dark:hover:text-primary"
						>
							UPI
						</a>
					</div>

					<div class="flex justify-center">
						<QRCode
							value={upiLink}
							size={156}
							fgColor="var(--sponsor-qr-fg)"
							bgColor="var(--sponsor-qr-bg)"
							class="size-40"
							errorCorrectionLevel="H"
						/>
					</div>

					<div
						class="mt-2 flex items-center justify-end gap-1 text-[10px] text-ink/70 dark:text-primary/70"
					>
						<span>For Indian users</span>
						<SmileIcon class="size-3" />
					</div>
				</div>
			</div> -->
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<style>
	/* .sponsor-qr-panel {
		--sponsor-qr-fg: var(--color-ink);
		--sponsor-qr-bg: var(--color-ink-dim);
	}

	:global(.dark) .sponsor-qr-panel {
		--sponsor-qr-fg: oklch(90.701% 0.14561 187.94);
		--sponsor-qr-bg: oklch(27.101% 0.03175 209.055);
	} */
</style>
