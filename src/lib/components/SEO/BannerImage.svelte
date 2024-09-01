<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Image from './Image.svelte';

	export let imageData;

	onMount(() => {
		if (browser) {
			document.lazyloadInstance.update();
		}
	});

	const { alt, width, height, src, sources, placeholder } = imageData;
	const sizes = '(max-width: 672px) calc(100vw - 32px), 672px';
</script>

<Image
	{alt}
	{height}
	loading="eager"
	{placeholder}
	{sizes}
	{sources}
	{src}
	style={'border-radius:12px;margin-bottom:48px'}
	{width}
/>