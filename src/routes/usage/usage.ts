import type { Component } from 'svelte';

import {
	Base,
	Basic,
	CssAnchor,
	Draggable,
	FocusLocation,
	Performance
} from '$lib/components/usage';

import baseSource from '$lib/components/usage/base.svelte?raw';
import basicSource from '$lib/components/usage/basic.svelte?raw';
import cssAnchorSource from '$lib/components/usage/css-anchor.svelte?raw';
import draggableSource from '$lib/components/usage/draggable.svelte?raw';
import focusLocationSource from '$lib/components/usage/focus-location.svelte?raw';
import performanceSource from '$lib/components/usage/performance.svelte?raw';

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
		desc: 'Minimal globe setup with animated rotation, markers, and a single arc for a fast starting point.',
		preview: Base,
		code: baseSource,
		name: 'base.svelte'
	},
	// {
	// 	title: 'Basic Example',
	// 	desc: 'Smallest working canvas example when you only need a mounted globe without extra lifecycle management.',
	// 	preview: Basic,
	// 	code: basicSource,
	// 	name: 'basic.svelte'
	// },
	{
		title: 'Draggable Globe',
		desc: 'Pointer-driven globe interaction with inertia and bounded tilt so users can explore the scene directly.',
		preview: Draggable,
		code: draggableSource,
		name: 'draggable.svelte'
	},
	{
		title: 'CSS Anchor Labels',
		desc: 'Attaches HTML labels to globe markers using CSS anchor positioning for richer marker annotations.',
		preview: CssAnchor,
		code: cssAnchorSource,
		name: 'css-anchor.svelte'
	},
	{
		title: 'Focus Location',
		desc: 'Smoothly rotates the globe toward a target latitude and longitude to highlight a specific place.',
		preview: FocusLocation,
		code: focusLocationSource,
		name: 'focus-location.svelte'
	},
	{
		title: 'Performance Pattern',
		desc: 'Shows how to pause rendering off-screen and recreate the globe only when it is visible again.',
		preview: Performance,
		code: performanceSource,
		name: 'performance.svelte'
	}
];
