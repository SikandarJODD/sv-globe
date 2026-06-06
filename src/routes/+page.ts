import type { PageLoad } from './$types';
import { buildPageSeo } from '$lib/seo';

export const load: PageLoad = () => {
	return buildPageSeo({
		pathname: '/',
		title: 'Svelte Globe Examples',
		description:
			'Setup guides and example patterns for building interactive 3D globe interfaces in Svelte with COBE.'
	});
};
