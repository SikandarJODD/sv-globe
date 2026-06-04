<script lang="ts">
	import type { File, FileContents, ThemesType } from '@pierre/diffs';
	import { mode } from 'mode-watcher';
	import { onDestroy, onMount } from 'svelte';

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
	class="container h-120 overflow-hidden rounded-xl border border-ink/12 bg-card dark:border-border"
>
	<div class="h-full overflow-y-auto rounded-lg">
		<div bind:this={container}></div>
	</div>
</div>
