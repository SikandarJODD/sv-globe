<script lang="ts">
	import DesktopNav from './desktop-nav.svelte';
	import MobileNav from './mobile-nav.svelte';
	import { githubLink, navItems, polarCheckoutLink, sponsorLink } from './nav';

	const title = 'sv-globe';
</script>

<DesktopNav items={navItems} {githubLink} {sponsorLink} {polarCheckoutLink} {title} />
<MobileNav items={navItems} {githubLink} {sponsorLink} {title} />
