<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		href: string;
		class?: string;
		label?: string;
	}

	let { href, class: className = '', label = 'Sponsor my work' }: Props = $props();
</script>

<a {href} target="_blank" rel="noreferrer" class={cn('min-w-full', className)}>
	{label}
</a>
