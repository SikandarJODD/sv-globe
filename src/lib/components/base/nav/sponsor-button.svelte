<script lang="ts">
	interface Props {
		href: string;
		className?: string;
		label?: string;
	}

	let {
		href,
		className = '',
		label = 'Sponsor my work'
	}: Props = $props();
</script>

<a
	href={href}
	target="_blank"
	rel="noreferrer"
	class={className}
>
	{label}
</a>
