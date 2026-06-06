import type { PageLoad } from './$types';
import { buildPageSeo } from '$lib/seo';

export const load: PageLoad = () => {
	return buildPageSeo({
		pathname: '/setup',
		title: 'Installation & Setup for Svelte Globe',
		description:
			'Install COBE, preview the base globe setup, and start integrating interactive globe interfaces in SvelteKit.'
	});
};
