<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { page } from '$app/state';
	import { docsBottomNavItems } from '$lib/components/base/nav/nav';
	import { cn } from '$lib/utils';

	type DocsBottomNavProps = {
		class?: string;
	};

	let { class: className }: DocsBottomNavProps = $props();

	const normalizePath = (pathname: string) => {
		if (pathname === '/') return pathname;
		return pathname.replace(/\/+$/, '');
	};

	const currentPath = $derived(normalizePath(page.url.pathname));
	const currentIndex = $derived(
		docsBottomNavItems.findIndex((item) => normalizePath(item.href) === currentPath)
	);
	const previousItem = $derived(currentIndex > 0 ? docsBottomNavItems[currentIndex - 1] : null);
	const nextItem = $derived(
		currentIndex >= 0 && currentIndex < docsBottomNavItems.length - 1
			? docsBottomNavItems[currentIndex + 1]
			: null
	);

	const cardClass =
		'group flex min-h-19 flex-col justify-between rounded-xl border border-ink/12 bg-card px-4 py-3.5 transition-colors hover:border-ink/24 hover:bg-ink/[0.03] dark:border-border dark:hover:border-primary/20 dark:hover:bg-primary/[0.03]';
</script>

{#if currentIndex !== -1 && (previousItem || nextItem)}
	<nav
		aria-label="Docs pagination"
		class={cn('w-full max-w-3xl border-t border-ink/12 pt-8 dark:border-border', className)}
	>
		<div class="grid gap-4 sm:grid-cols-2">
			{#if previousItem}
				<a href={previousItem.href} class={cn(cardClass, 'items-start text-left')}>
					<div
						class="flex items-center gap-px text-xs font-medium text-ink/70 dark:text-muted-foreground"
					>
						<ChevronLeftIcon class="size-4" />
						<p
							class="mb-0.5 font-figtree text-sm font-medium text-ink/70 group-hover:text-ink/90 dark:text-foreground"
						>
							{previousItem.label}
						</p>
					</div>

					<p class="line-clamp-1 pl-1 max-w-[32ch] text-sm text-ink/60 dark:text-muted-foreground">
						{previousItem.description}
					</p>
				</a>
			{:else}
				<div class="hidden sm:block"></div>
			{/if}

			{#if nextItem}
				<a href={nextItem.href} class={cn(cardClass, 'items-end text-right')}>
					<div
						class="flex items-center gap-px text-xs font-medium text-ink/40 dark:text-muted-foreground"
					>
						<p
							class="mb-0.5 font-figtree text-sm font-medium text-ink/90 group-hover:text-ink dark:text-foreground"
						>
							{nextItem.label}
						</p>
						<ChevronRightIcon class="size-4" />
					</div>

					<div class="space-y-1">
						<p class="line-clamp-1 pr-1.5 max-w-[32ch] text-sm text-ink/60 dark:text-muted-foreground">
							{nextItem.description}
						</p>
					</div>
				</a>
			{/if}
		</div>
	</nav>
{/if}
