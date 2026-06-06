export type NavItem = {
	href: string;
	label: string;
};

export type DocsNavItem = NavItem & {
	description: string;
};

export const navItems: NavItem[] = [
	{ href: '/setup', label: 'Setup' },
	{ href: '/usage', label: 'Usage' },
	{ href: '/examples', label: 'Examples' },
	{ href: '/performance', label: 'Performance' },
	{ href: '/llms.txt', label: 'llms.txt' }
];

export const docsBottomNavItems: DocsNavItem[] = [
	{
		href: '/setup',
		label: 'Installation & Setup',
		description: 'Set up SvelteKit, initialize shadcn-svelte, and add your first globe.'
	},
	{
		href: '/usage',
		label: 'Usage',
		description: 'Learn the core API, props, and the globe configuration workflow.'
	},
	{
		href: '/examples',
		label: 'Examples',
		description: 'Browse ready-made globe patterns you can adapt to your own scenes.'
	},
	{
		href: '/performance',
		label: 'Performance',
		description: 'Tune rendering cost, animation, and interaction smoothness.'
	}
];

export const githubLink = 'https://github.com/SikandarJODD/sv-globe';
export const sponsorLink = 'https://github.com/sponsors/SikandarJODD';
