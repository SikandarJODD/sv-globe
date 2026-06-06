import type { RequestHandler } from './$types';
import { getCanonicalUrl, indexablePaths } from '$lib/seo';

export const prerender = true;

export const GET: RequestHandler = () => {
	const urls = indexablePaths
		.map(
			(pathname) => `
	<url>
		<loc>${getCanonicalUrl(pathname)}</loc>
	</url>`
		)
		.join('');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8'
		}
	});
};
