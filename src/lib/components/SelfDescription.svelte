<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { writable } from 'svelte/store';

	export let attributes: string[] = [];
	export let initialDelay: number = 500;
	export let cycleDelay: number = 1500;

	const currentIndex = writable(0);
	const visible = writable(true);

	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function cycleAttributes() {
		let i = 0;
		while (true) {
			visible.set(false);
			await sleep(initialDelay);
			currentIndex.set(i);
			visible.set(true);
			await sleep(cycleDelay);
			i = (i + 1) % attributes.length;
		}
	}

	onMount(() => {
		cycleAttributes();
	});
</script>

{#if $visible}
	<span class="text-blue-600" transition:fly={{ y: 20, duration: 500 }}>
		{$currentIndex < attributes.length ? attributes[$currentIndex] : ''}
	</span>
{/if}.