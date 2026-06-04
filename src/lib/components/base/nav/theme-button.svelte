<script lang="ts">
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { mode, toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';

	interface Props {
		className?: string;
	}

	let { className = '' }: Props = $props();
</script>

<Button
	variant="ghost"
	size="icon-sm"
	class={className}
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
