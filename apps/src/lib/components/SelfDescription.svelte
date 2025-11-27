<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		attributes?: string[];
	}

	let { attributes = [] }: Props = $props();

	// State for the typewriter/cycle effect
	let currentIndex = $state(0);
	let isVisible = $state(true);

	onMount(() => {
		const interval = setInterval(() => {
			isVisible = false; // Fade out
			setTimeout(() => {
				currentIndex = (currentIndex + 1) % attributes.length;
				isVisible = true; // Fade in
			}, 200); // Wait for fade out to finish
		}, 3000); // Change word every 3 seconds

		return () => clearInterval(interval);
	});
</script>

<span class="inline-flex relative overflow-hidden">
	<span class="invisible font-medium" aria-hidden="true">
		{attributes.reduce((a, b) => (a.length > b.length ? a : b), '')}
	</span>

	<span
		class="absolute left-0 top-0 font-medium text-neutral-900 transition-opacity duration-200 ease-in-out"
		class:opacity-0={!isVisible}
		class:opacity-100={isVisible}
	>
		{attributes[currentIndex]}
	</span>
</span>
