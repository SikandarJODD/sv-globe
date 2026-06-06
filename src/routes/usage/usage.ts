import type { Component } from 'svelte';

import {
	ArcTour,
	Base,
	Basic,
	Colors,
	CssAnchor,
	Draggable,
	FocusLocation,
	Performance
} from '$lib/components/usage';
import { usageCode } from '$lib/components/usage/code';

export type UsageItem = {
	title: string;
	desc: string;
	preview: Component;
	code: string;
	name: string;
};

export const usageItems: UsageItem[] = [
	{
		title: 'Base Setup',
		desc: 'Minimal globe setup with animated rotation and markers for a fast starting point.',
		preview: Base,
		code: usageCode.base,
		name: 'base.svelte'
	},
	// {
	// 	title: 'Basic Example',
	// 	desc: 'Smallest working canvas example when you only need a mounted globe without extra lifecycle management.',
	// 	preview: Basic,
	// 	code: usageCode.basic,
	// 	name: 'basic.svelte'
	// },
	{
		title: 'Draggable Globe',
		desc: 'Pointer-driven globe interaction with inertia and bounded tilt so users can explore the scene directly.',
		preview: Draggable,
		code: usageCode.draggable,
		name: 'draggable.svelte'
	},
	{
		title: 'Globe Colors',
		desc: 'Shows how `baseColor`, `markerColor`, `arcColor`, `dark`, and `mapBrightness` change the globe mood without adding extra interaction.',
		preview: Colors,
		code: usageCode.colors,
		name: 'colors.svelte'
	},
	{
		title: 'CSS Anchor Labels',
		desc: 'Attaches HTML labels to globe markers using CSS anchor positioning for richer marker annotations.',
		preview: CssAnchor,
		code: usageCode.cssAnchor,
		name: 'css-anchor.svelte'
	},
	{
		title: 'Focus Location',
		desc: 'Smoothly rotates the globe toward a target latitude and longitude to highlight a specific place.',
		preview: FocusLocation,
		code: usageCode.focusLocation,
		name: 'focus-location.svelte'
	},
	{
		title: 'Dynamic Arc Tour',
		desc: 'Switch between five routes, auto-focus the destination city, and keep drag interaction available for a richer flight-style preview.',
		preview: ArcTour,
		code: usageCode.arcTour,
		name: 'arc-tour.svelte'
	},
	{
		title: 'Performance Pattern',
		desc: 'Shows how to pause rendering off-screen and resume animation only when the globe is visible again.',
		preview: Performance,
		code: usageCode.performance,
		name: 'performance.svelte'
	}
];
