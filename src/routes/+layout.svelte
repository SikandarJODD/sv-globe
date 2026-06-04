<script lang="ts">
	import Nav from '$lib/components/base/nav/nav.svelte';
	import DocsBottomNav from '$lib/components/base/docs-bottom-nav.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { activeElement, PressedKeys } from 'runed';
	import { ModeWatcher, toggleMode } from 'mode-watcher';

	let { children } = $props();

	let keys = new PressedKeys();
	keys.onKeys(['d'], () => {
		if (
			activeElement.current?.localName === 'input' ||
			activeElement.current?.localName === 'textarea'
		)
			return;
		toggleMode();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher defaultMode="dark" />

<main class="px-6 pt-10 pb-28 sm:px-8 lg:px-10 lg:pb-10">
	<div class="mx-auto flex max-w-6xl justify-center">
		<div class="grid w-full max-w-5xl gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
			<Nav />
			<div class="flex min-w-0 flex-col gap-10">
				<div class="min-w-0">
					{@render children()}
				</div>
				<DocsBottomNav />
			</div>
		</div>
	</div>
</main>
