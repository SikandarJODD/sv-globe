<script lang="ts">
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { mode, toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<Button
	variant="ghost"
	size="icon-sm"
	class={cn('text-muted-foreground', className)}
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
