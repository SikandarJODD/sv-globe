import type { LayoutLoad } from './$types';
import { buildBaseMetaTags } from '$lib/seo';

export const prerender = true;

export const load: LayoutLoad = ({ url }) => {
	return buildBaseMetaTags(url.pathname);
};
