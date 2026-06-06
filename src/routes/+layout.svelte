<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { mobileTransitionRouteOrder } from '$lib/components/base/nav/nav';
	import Nav from '$lib/components/base/nav/nav.svelte';
	import DocsBottomNav from '$lib/components/base/docs-bottom-nav.svelte';
	import { siteJsonLd } from '$lib/seo';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { activeElement, PressedKeys } from 'runed';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import { JsonLd, MetaTags, deepMerge } from 'svelte-meta-tags';

	type NavTransitionName = 'page-forward' | 'page-back';
	type ViewTransition = {
		finished: Promise<void>;
	};
	type ViewTransitionDocument = Document & {
		startViewTransition?: (callback: () => Promise<void> | void) => ViewTransition;
	};

	const MOBILE_TOUCH_QUERY = '(max-width: 768px) and (pointer: coarse)';
	const REDUCE_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

	let { data, children } = $props();
	let fallbackTransition = $state<NavTransitionName | null>(null);
	let fallbackTargetPath = $state<string | null>(null);

	let keys = new PressedKeys();
	keys.onKeys(['d'], () => {
		if (
			activeElement.current?.localName === 'input' ||
			activeElement.current?.localName === 'textarea'
		)
			return;
		toggleMode();
	});

	let metaTags = $derived(deepMerge(data.baseMetaTags, page.data.pageMetaTags));
	let pageSchema = $derived(page.data.pageSchema);
	let pageContentClass = $derived.by(() => {
		if (!fallbackTransition || !fallbackTargetPath) return '';
		if (normalizePathname(page.url.pathname) !== fallbackTargetPath) return '';

		return `route-fallback route-fallback--${fallbackTransition}`;
	});

	function normalizePathname(pathname: string | undefined): string {
		if (!pathname || pathname === '/') return '/';
		return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
	}

	function getNavTransition(
		fromPathname: string | undefined,
		toPathname: string | undefined
	): NavTransitionName | null {
		const from = normalizePathname(fromPathname);
		const to = normalizePathname(toPathname);
		const fromIndex = mobileTransitionRouteOrder.indexOf(from);
		const toIndex = mobileTransitionRouteOrder.indexOf(to);

		if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return null;

		return toIndex > fromIndex ? 'page-forward' : 'page-back';
	}

	function shouldUseMobileTransitions() {
		return (
			window.matchMedia(MOBILE_TOUCH_QUERY).matches &&
			!window.matchMedia(REDUCE_MOTION_QUERY).matches
		);
	}

	function clearFallbackTransition() {
		fallbackTransition = null;
		fallbackTargetPath = null;
	}

	onNavigate((navigation) => {
		clearFallbackTransition();

		if (!navigation.from?.url || !navigation.to?.url) return;

		const transitionName = getNavTransition(
			navigation.from.url.pathname,
			navigation.to.url.pathname
		);

		if (!transitionName) return;
		if (!shouldUseMobileTransitions()) return;

		const viewTransitionDocument = document as ViewTransitionDocument;
		const startViewTransition = viewTransitionDocument.startViewTransition?.bind(document);

		if (!startViewTransition) {
			fallbackTransition = transitionName;
			fallbackTargetPath = normalizePathname(navigation.to.url.pathname);
			void navigation.complete.catch(() => {
				clearFallbackTransition();
			});
			return;
		}

		document.documentElement.dataset.navTransition = transitionName;

		return new Promise<void>((resolve) => {
			const transition = startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});

			transition.finished.finally(() => {
				delete document.documentElement.dataset.navTransition;
			});
		});
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<MetaTags {...metaTags} />
<JsonLd schema={siteJsonLd} />
{#if pageSchema}
	<JsonLd schema={pageSchema} />
{/if}

<ModeWatcher defaultMode="dark" />

<main class="px-6 md:pt-12 pb-28 sm:px-8 lg:px-10 lg:pb-10">
	<div class="mx-auto flex max-w-6xl justify-center">
		<div class="grid w-full max-w-5xl gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
			<Nav />
			<div class="flex min-w-0 flex-col gap-10">
				<div class="min-w-0">
					{#key page.url.pathname}
						<div class={pageContentClass} onanimationend={clearFallbackTransition}>
							{@render children()}
						</div>
					{/key}
				</div>
				<DocsBottomNav />
			</div>
		</div>
	</div>
</main>
