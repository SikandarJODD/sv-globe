<script lang="ts">
	import DesktopNav from './desktop-nav.svelte';
	import MobileNav from './mobile-nav.svelte';
	import { githubLink, navItems, sponsorLink } from './nav';

	const title = 'sv-globe';
</script>

<DesktopNav items={navItems} {githubLink} {sponsorLink} {title} />
<MobileNav items={navItems} {githubLink} {sponsorLink} {title} />
