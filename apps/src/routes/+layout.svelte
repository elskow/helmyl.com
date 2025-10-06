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

<div class="depth-of-field-overlay"></div>

<style>
	.depth-of-field-overlay {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 200px;
		pointer-events: none;
		z-index: 40;
		background: linear-gradient(
			to top,
			rgba(255, 255, 255, 0.95) 0%,
			rgba(255, 255, 255, 0.7) 20%,
			rgba(255, 255, 255, 0.3) 50%,
			transparent 100%
		);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		mask-image: linear-gradient(
			to top,
			black 0%,
			black 20%,
			rgba(0, 0, 0, 0.5) 50%,
			transparent 100%
		);
		-webkit-mask-image: linear-gradient(
			to top,
			black 0%,
			black 20%,
			rgba(0, 0, 0, 0.5) 50%,
			transparent 100%
		);
	}

	@media (prefers-color-scheme: dark) {
		.depth-of-field-overlay {
			background: linear-gradient(
				to top,
				rgba(24, 24, 27, 0.95) 0%,
				rgba(24, 24, 27, 0.7) 20%,
				rgba(24, 24, 27, 0.3) 50%,
				transparent 100%
			);
		}
	}

	/* Adjust for mobile screens */
	@media (max-width: 640px) {
		.depth-of-field-overlay {
			height: 150px;
		}
	}
</style>
