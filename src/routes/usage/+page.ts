import type { PageLoad } from './$types';
import { buildPageSeo } from '$lib/seo';

export const load: PageLoad = () => {
	return buildPageSeo({
		pathname: '/usage',
		title: 'Usage Patterns for Svelte Globe',
		description:
			'Learn draggable globes, CSS anchors, focus states, and performance-aware patterns for Svelte globe components.'
	});
};
