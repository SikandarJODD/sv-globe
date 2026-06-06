<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface HighlightProps {
		children: Snippet;
		class?: string;
	}

	let { children, class: className = '' }: HighlightProps = $props();
</script>

<span class={cn('bg-ink/8 px-1 text-ink dark:bg-primary/12 dark:text-primary', className)}>
	{@render children?.()}
</span>
