import type { PageLoad } from './$types';
import { buildPageSeo } from '$lib/seo';

export const load: PageLoad = () => {
	return buildPageSeo({
		pathname: '/performance',
		title: 'Performance Guide for Svelte Globe',
		description:
			'Performance guidance for Svelte globe rendering. This page is a placeholder and is not ready for indexing.',
		noindex: true
	});
};
