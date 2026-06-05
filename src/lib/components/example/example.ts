import type { Component } from 'svelte';

import Polaroids from '$lib/components/example/polaroids.svelte';
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
		title: 'Sticker Globe',
		desc: 'Anchors emoji stickers to globe markers so you can mix COBE rendering with HTML overlays.',
		preview: Sticker,
		code: exampleCode.sticker,
		name: 'sticker.svelte'
	},
	{
		title: 'Polaroid Globe',
		desc: 'Pins travel-photo cards to globe markers using showcase data so the overlay stays aligned with the rotating globe.',
		preview: Polaroids,
		code: exampleCode.polaroid,
		name: 'polaroids.svelte'
	}
];
