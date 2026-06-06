import type { PageLoad } from './$types';
import { buildPageSeo } from '$lib/seo';

export const load: PageLoad = () => {
	return buildPageSeo({
		pathname: '/examples',
		title: 'Interactive Svelte Globe Examples',
		description:
			'Browse complete Svelte globe demos including CDN, sticker, flight, satellite, and polaroid examples built with COBE.'
	});
};
