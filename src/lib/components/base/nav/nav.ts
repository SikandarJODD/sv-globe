export type NavItem = {
	href: string;
	label: string;
};

export type DocsNavItem = NavItem & {
	description: string;
};

type DocsRouteEntry = {
	href: string;
	navLabel: string;
	label: string;
	description: string;
};

export const docsRouteStack: DocsRouteEntry[] = [
	{
		href: '/',
		navLabel: 'Home',
		label: 'Home',
		description: 'Start with the project overview, goals, and credits.'
	},
	{
		href: '/setup',
		navLabel: 'Setup',
		label: 'Installation & Setup',
		description: 'Set up SvelteKit, initialize shadcn-svelte, and add your first globe.'
	},
	{
		href: '/usage',
		navLabel: 'Usage',
		label: 'Usage',
		description: 'Learn the core API, props, and the globe configuration workflow.'
	},
	{
		href: '/examples',
		navLabel: 'Examples',
		label: 'Examples',
		description: 'Browse ready-made globe patterns you can adapt to your own scenes.'
	},
	{
		href: '/performance',
		navLabel: 'Performance',
		label: 'Performance',
		description: 'Tune rendering cost, animation, and interaction smoothness.'
	}
];

export const mobileTransitionRouteOrder = docsRouteStack.map(({ href }) => href);

export const navItems: NavItem[] = [
	...docsRouteStack
		// .filter(({ href }) => href !== '/')
		.map(({ href, navLabel }) => ({ href, label: navLabel })),
	{ href: '/llms.txt', label: 'llms.txt' }
];

export const docsBottomNavItems: DocsNavItem[] = docsRouteStack
	.filter(({ href }) => href !== '/')
	.map(({ href, label, description }) => ({ href, label, description }));

export const githubLink = 'https://github.com/SikandarJODD/sv-globe';
export const sponsorLink = 'https://github.com/sponsors/SikandarJODD';
