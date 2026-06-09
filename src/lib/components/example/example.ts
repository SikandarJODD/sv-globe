import type { Component } from 'svelte';

import Cdn from '$lib/components/example/cdn.svelte';
import Flight from '$lib/components/example/flight.svelte';
import NeonGlobe from '$lib/components/example/neon-globe.svelte';
import Polaroids from '$lib/components/example/polaroids.svelte';
import Satellites from '$lib/components/example/satellites.svelte';
import Sticker from '$lib/components/example/sticker.svelte';
import { exampleCode } from '$lib/components/example/code';

export type ExampleItem = {
	title: string;
	desc: string;
	preview: Component;
	code: string;
	name: string;
};

export const exampleItems: ExampleItem[] = [
	{
		title: 'Neon Globe',
		desc: 'Focuses AWS regions with a select-driven neon marker card, smooth camera easing, and lazy globe startup for better performance.',
		preview: NeonGlobe,
		code: exampleCode.neonGlobe,
		name: 'neon-globe.svelte'
	},
	{
		title: 'CDN Globe',
		desc: 'Shows an edge network with draggable rotation, animated node overlays, and route arcs between regions.',
		preview: Cdn,
		code: exampleCode.cdn,
		name: 'cdn.svelte'
	},
	{
		title: 'Sticker Globe',
		desc: 'Anchors emoji stickers to globe markers so you can mix COBE rendering with HTML overlays.',
		preview: Sticker,
		code: exampleCode.sticker,
		name: 'sticker.svelte'
	},
	{
		title: 'Flight Globe',
		desc: 'Combines draggable rotation with flight arcs, airport markers, and route labels derived from the shared showcase data.',
		preview: Flight,
		code: exampleCode.flight,
		name: 'flight.svelte'
	},
	{
		title: 'Satellite Globe',
		desc: 'Pins animated satellite beacons to elevated markers so the globe reads like a live orbital network.',
		preview: Satellites,
		code: exampleCode.satellites,
		name: 'satellites.svelte'
	},
	{
		title: 'Polaroid Globe',
		desc: 'Pins travel-photo cards to globe markers using showcase data so the overlay stays aligned with the rotating globe.',
		preview: Polaroids,
		code: exampleCode.polaroid,
		name: 'polaroids.svelte'
	}
];
