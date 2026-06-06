<script lang="ts">
	import type { File, FileContents, ThemesType } from '@pierre/diffs';
	import CopyButton from '../copy-button/copy-button.svelte';
	import { mode } from 'mode-watcher';
	import { onDestroy, onMount } from 'svelte';
	import { cn } from '$lib/utils';

	const defaultTheme: ThemesType = {
		dark: 'pierre-dark',
		light: 'github-light-default'
	};

	export type CodeProps = {
		name: string;
		code: string;
		overflow?: 'scroll' | 'wrap';
		stickyHeader?: boolean;
		disableFileHeader?: boolean;
		theme?: ThemesType;
	};

	let {
		name,
		code,
		overflow = 'scroll',
		stickyHeader = true,
		disableFileHeader = false,
		theme = defaultTheme
	}: CodeProps = $props();

	let container: HTMLDivElement | null = null;
	let instance: File | null = null;
	let observer: IntersectionObserver | null = null;
	let hasRendered = false;
	let renderPromise: Promise<void> | null = null;

	function createFileContents(): FileContents {
		return {
			name,
			contents: code
		};
	}

	async function renderCode() {
		if (!container || hasRendered || renderPromise) return;

		renderPromise = (async () => {
			const { File } = await import('@pierre/diffs');

			if (!container || hasRendered) return;

			instance = new File({
				theme,
				overflow,
				themeType: mode.current,
				stickyHeader,
				disableFileHeader
			});

			instance.render({
				file: createFileContents(),
				containerWrapper: container
			});

			hasRendered = true;
			observer?.disconnect();
			observer = null;
		})().finally(() => {
			renderPromise = null;
		});

		await renderPromise;
	}

	function destroyCode() {
		observer?.disconnect();
		observer = null;
		renderPromise = null;
		instance?.cleanUp();
		instance = null;
		hasRendered = false;
	}

	$effect(() => {
		mode.current;
		instance?.setThemeType(mode.current as 'dark' | 'light');
	});

	let hasMoreContent = $derived(code.length > 300);

	onMount(() => {
		if (!container) return;

		observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					renderCode();
				}
			},
			{
				threshold: 0.1
			}
		);

		observer.observe(container);
	});

	onDestroy(() => {
		destroyCode();
		container = null;
	});

</script>

<div
	class="relative container min-h-40 overflow-hidden rounded-xl border border-ink/12 bg-card dark:border-border"
>
	<div
		class={cn(
			'absolute top-2 right-2 z-10 flex h-0 justify-end',
			hasMoreContent && 'pointer-events-none top-2.5 right-4'
		)}
	>
		<CopyButton
			text={code}
			size="icon-sm"
			tabindex={0}
			title={`Copy ${name}`}
			class="pointer-events-auto rounded-sm border border-dashed border-ink/50 bg-ink/5 text-ink shadow-none backdrop-blur-sm transition-colors hover:border-ink/50 hover:bg-ink/10 hover:text-ink dark:border-primary/50  dark:bg-card/90 dark:text-primary dark:hover:bg-primary/10 [&_svg]:size-3.5"
		/>
	</div>
	<div class="relative h-full max-h-120 overflow-y-auto rounded-lg">
		<div bind:this={container}></div>
	</div>
</div>
