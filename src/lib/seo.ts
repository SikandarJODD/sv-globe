import {
	defineBaseMetaTags,
	definePageMetaTags,
	type JsonLdProps,
	type MetaTagsProps
} from 'svelte-meta-tags';

export const siteConfig = {
	siteUrl: 'https://sv-globe.vercel.app',
	siteName: 'SV Globe',
	brandTitle: 'Svelte Globe Examples',
	repoUrl: 'https://github.com/SikandarJODD/sv-globe',
	githubProfileUrl: 'https://github.com/SikandarJODD',
	socialHandle: '@Sikandar_Bhide',
	xUrl: 'https://x.com/Sikandar_Bhide',
	defaultOgPath: '/og.png',
	defaultDescription:
		'Setup guides and example patterns for building interactive 3D globe interfaces in Svelte with COBE.'
} as const;

export const indexablePaths = ['/', '/setup', '/usage', '/examples'] as const;

export type PageSeoInput = {
	pathname: string;
	title: string;
	description: string;
	noindex?: boolean;
};

const defaultOgImage = {
	url: absoluteUrl(siteConfig.defaultOgPath),
	secureUrl: absoluteUrl(siteConfig.defaultOgPath),
	type: 'image/png',
	width: 1200,
	height: 630,
	alt: `${siteConfig.brandTitle} preview image`
} as const;

export function absoluteUrl(path: string) {
	try {
		return new URL(path).href;
	} catch {
		return new URL(path, siteConfig.siteUrl).href;
	}
}

export function normalizePathname(pathname: string) {
	if (!pathname || pathname === '/') return '/';
	return pathname.replace(/\/+$/, '');
}

export function getCanonicalUrl(pathname: string) {
	return absoluteUrl(normalizePathname(pathname));
}

export function buildBaseMetaTags(pathname: string) {
	const canonical = getCanonicalUrl(pathname);

	return defineBaseMetaTags({
		title: siteConfig.brandTitle,
		description: siteConfig.defaultDescription,
		canonical,
		openGraph: {
			type: 'website',
			url: canonical,
			title: siteConfig.brandTitle,
			description: siteConfig.defaultDescription,
			siteName: siteConfig.siteName,
			images: [defaultOgImage]
		},
		twitter: {
			cardType: 'summary_large_image',
			creator: siteConfig.socialHandle,
			site: siteConfig.socialHandle,
			title: siteConfig.brandTitle,
			description: siteConfig.defaultDescription,
			image: defaultOgImage.url,
			imageAlt: defaultOgImage.alt
		}
	});
}

export function buildPageMetaTags({ pathname, title, description, noindex = false }: PageSeoInput) {
	const canonical = getCanonicalUrl(pathname);
	const metaTags: MetaTagsProps = {
		title,
		description,
		canonical,
		robots: noindex ? 'noindex,follow' : 'index,follow',
		openGraph: {
			url: canonical,
			title,
			description
		},
		twitter: {
			title,
			description,
			image: defaultOgImage.url,
			imageAlt: defaultOgImage.alt
		}
	};

	return definePageMetaTags(metaTags);
}

export function buildWebPageSchema({ pathname, title, description }: PageSeoInput) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		'@id': `${getCanonicalUrl(pathname)}#webpage`,
		url: getCanonicalUrl(pathname),
		name: title,
		description,
		isPartOf: {
			'@id': `${siteConfig.siteUrl}/#website`
		}
	} satisfies NonNullable<JsonLdProps['schema']>;
}

export function buildPageSeo(input: PageSeoInput) {
	return {
		...buildPageMetaTags(input),
		...(input.noindex ? {} : { pageSchema: buildWebPageSchema(input) })
	};
}

export const siteJsonLd = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'WebSite',
			'@id': `${siteConfig.siteUrl}/#website`,
			url: siteConfig.siteUrl,
			name: siteConfig.siteName,
			alternateName: siteConfig.brandTitle
		},
		{
			'@type': 'Person',
			'@id': `${siteConfig.siteUrl}/#person`,
			name: 'Sikandar Bhide',
			url: siteConfig.siteUrl,
			sameAs: [siteConfig.githubProfileUrl, siteConfig.xUrl]
		}
	]
} satisfies NonNullable<JsonLdProps['schema']>;
