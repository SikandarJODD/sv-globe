<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Code } from '$lib/components/ui/code';
	import { cn } from '$lib/utils';
	import type { ComponentProps, Snippet } from 'svelte';

	interface PreviewComponentProps {
		children: Snippet;
		code?: ComponentProps<typeof Code>;
		showRetry?: boolean;
		isCentered?: boolean;
		class?: string;
	}

	let {
		code,
		children,
		showRetry = true,
		isCentered = true,
		class: className = ''
	}: PreviewComponentProps = $props();

	type TabValue = 'preview' | 'code';
	let value: TabValue = $state('preview');
	let retryKey = $state(0);

	function handleRetry() {
		retryKey += 1;
	}
</script>

<div class="mt-2 w-full">
	<Tabs.Root bind:value class="gap-3">
		<Tabs.List
			variant="line"
			class="w-full justify-start gap-5 border-b border-dashed border-ink/15 px-0 pb-2 dark:border-border"
		>
			<Tabs.Trigger
				value="preview"
				class="h-auto flex-none rounded-none border-none bg-transparent! px-0 pb-1 font-figtree text-sm font-medium text-ink/55 shadow-none! transition-colors hover:text-ink dark:text-muted-foreground dark:hover:text-foreground data-active:text-ink dark:data-active:text-foreground data-active:border-ink/90 dark:data-active:border-foreground"
			>
				Preview
			</Tabs.Trigger>
			<Tabs.Trigger
				value="code"
				class="group h-auto flex-none rounded-none border-none bg-transparent! px-0 pb-1 font-figtree text-sm font-medium text-ink/55 shadow-none! transition-colors hover:text-ink dark:text-muted-foreground dark:hover:text-foreground data-active:text-ink dark:data-active:text-foreground"
			>
				Code
			</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="preview" class="mt-0" data-toc-ignore>
			<div
				class={cn(
					'relative flex min-h-64 w-full overflow-hidden rounded-xl border border-ink/12 bg-card p-6 shadow-[0_1px_0_0_rgba(16,24,40,0.02)] dark:border-border',
					isCentered ? 'items-center justify-center' : '',
					className
				)}
			>
				{#if showRetry}
					<Button
						variant="ghost"
						size="icon-sm"
						onclick={handleRetry}
						class="group absolute top-3 right-3 z-30 size-8 rounded-full border border-ink/10 bg-background/90 text-ink shadow-none backdrop-blur-sm transition-colors hover:border-ink/20 hover:bg-ink/5 hover:text-ink dark:border-border dark:bg-background dark:text-muted-foreground dark:hover:bg-muted/50 dark:hover:text-foreground"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-rotate-cw-icon lucide-rotate-cw transition-transform duration-200 ease-out group-hover:rotate-45"
							><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path
								d="M21 3v5h-5"
							/></svg
						>
					</Button>
				{/if}
				{#key retryKey}
					{#if children}
						{@render children?.()}
					{:else}
						<p class="text-muted-foreground">
							No component provided. Please provide a component to render.
						</p>
					{/if}
				{/key}
			</div>
		</Tabs.Content>
		<Tabs.Content value="code" class="mt-0" data-toc-ignore>
			{#if code}
				<Code {...code} />
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</div>
