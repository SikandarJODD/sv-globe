<script lang="ts">
	// Basic Example
	import createGlobe from 'cobe';
	import { type Globe } from 'cobe';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement | null = $state(null);
	let globe: Globe | null = $state(null);
	let phi = $state(0);

	// Convert lat/long to globe angles
	function locationToAngles(lat: number, long: number) {
		return [Math.PI - ((long * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];
	}

	const [targetPhi, targetTheta] = locationToAngles(35.68, 139.65);

	// Animate the globe
	function animate() {
		const distPhi = targetPhi - phi;
		phi += distPhi * 0.08;
		globe?.update({ phi, theta: targetTheta });
		requestAnimationFrame(animate);
	}

	onMount(() => {
		if (!canvas) return;
		globe = createGlobe(canvas, {
			devicePixelRatio: 2,
			width: 200,
			height: 200,
			phi: 0,
			theta: 0.2,
			dark: 0,
			diffuse: 1.2,
			mapSamples: 16000,
			mapBrightness: 6,
			baseColor: [1, 1, 1],
			markerColor: [0.2, 0.4, 1],
			glowColor: [1, 1, 1],
			markers: [
				{ location: [37.78, -122.44], size: 0.03, id: 'sf' },
				{ location: [40.71, -74.01], size: 0.03, id: 'nyc' }
			],
			arcs: [{ from: [37.78, -122.44], to: [40.71, -74.01] }],
			arcColor: [0.3, 0.5, 1],
			arcWidth: 0.5,
			arcHeight: 0.3
		});
		animate();
	});
</script>

<div class="container">
	<canvas bind:this={canvas}></canvas>
</div>
