<script lang="ts">
	export let alt: string;
	export let height: number; // needed to reduce CLS
	export let src: string;
	export let sources: { srcset: string; type: string }[] = [];
	export let placeholder: string;
	export let width: number; // needed to reduce CLS
	export let maxWidth = '1280px';
	export let sizes = `(max-width: ${maxWidth}) 100vw, ${maxWidth}}`;
	export let loading: 'lazy' | 'eager' | null | undefined = 'lazy';
	export let style = '';
</script>

<picture>
	{#each sources as source}
		<source data-sizes={sizes} data-srcset={source.srcset} type={source.type} {width} {height} />
	{/each}
	<img
		{alt}
		class="lazy"
		data-src={src}
		decoding="async"
		{height}
		loading={loading}
		src={placeholder}
		style={`max-width:${maxWidth};${style}`}
		{width}
	/>
</picture>

<style>
    img {
        height: auto;
    }

    img:not([src]):not([srcset]) {
        visibility: hidden;
    }
</style>