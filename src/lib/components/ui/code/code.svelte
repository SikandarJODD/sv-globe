<script lang="ts">
	import { File, type FileContents, type SupportedLanguages, type ThemesType } from '@pierre/diffs';
	import { mode } from 'mode-watcher';
	import { watch } from 'runed';

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

	const renderCode = (node: HTMLDivElement) => {
		// Create one Diffs instance per attached node so Svelte can fully dispose
		// it when the attachment is removed.
		const instance = new File({
			theme,
			overflow,
			themeType: mode.current,
			stickyHeader,
			disableFileHeader
		});

		// This component is optimized for mount-time content. If the file source
		// needs to update later, move this render call into its own nested effect.
		const file: FileContents = {
			name,
			contents: code
		};

		instance.render({
			file,
			containerWrapper: node
		});

		// Keep the syntax theme aligned with the app mode without recreating the
		// whole viewer instance.
		// $effect(() => {
		// 	instance.setThemeType(mode.current);
		// });
		watch(
			() => mode.current,
			() => {
				instance.setThemeType(mode.current as 'dark' | 'light');
			}
		);

		return () => {
			instance.cleanUp();
		};
	};
</script>

<div
	class="container h-120 overflow-hidden rounded-xl border border-ink/12 bg-card dark:border-border"
>
	<div class="h-full overflow-y-auto rounded-lg">
		<div {@attach renderCode}></div>
	</div>
</div>
