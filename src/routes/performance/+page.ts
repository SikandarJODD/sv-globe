import type { PageLoad } from './$types';
import { buildPageSeo } from '$lib/seo';

export const load: PageLoad = () => {
	return buildPageSeo({
		pathname: '/performance',
		title: 'Performance Guide for Svelte Globe',
		description:
			'Practical COBE performance guidance for Svelte globe rendering, including mapSamples tuning, visibility-aware animation, and cleanup patterns.'
	});
};
