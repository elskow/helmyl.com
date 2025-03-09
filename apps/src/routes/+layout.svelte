<script lang="ts">
	import '../app.css';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<link
		rel="alternate"
		type="application/rss+xml"
		title="Helmy Luqmanulhakim's Blog"
		href="/rss.xml"
	/>
</svelte:head>

{@render children?.()}
