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
		height: 140px;
		pointer-events: none;
		z-index: 40;
		background: linear-gradient(
			to top,
			rgba(255, 255, 255, 0.6) 0%,
			rgba(255, 255, 255, 0.48) 8%,
			rgba(255, 255, 255, 0.36) 18%,
			rgba(255, 255, 255, 0.26) 30%,
			rgba(255, 255, 255, 0.18) 44%,
			rgba(255, 255, 255, 0.12) 60%,
			rgba(255, 255, 255, 0.06) 78%,
			rgba(255, 255, 255, 0.02) 90%,
			transparent 100%
		);
		backdrop-filter: blur(3px);
		-webkit-backdrop-filter: blur(3px);
		mask-image: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.9) 0%,
			rgba(0, 0, 0, 0.75) 8%,
			rgba(0, 0, 0, 0.6) 18%,
			rgba(0, 0, 0, 0.45) 30%,
			rgba(0, 0, 0, 0.32) 44%,
			rgba(0, 0, 0, 0.2) 60%,
			rgba(0, 0, 0, 0.1) 78%,
			rgba(0, 0, 0, 0.03) 90%,
			transparent 100%
		);
		-webkit-mask-image: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.9) 0%,
			rgba(0, 0, 0, 0.75) 8%,
			rgba(0, 0, 0, 0.6) 18%,
			rgba(0, 0, 0, 0.45) 30%,
			rgba(0, 0, 0, 0.32) 44%,
			rgba(0, 0, 0, 0.2) 60%,
			rgba(0, 0, 0, 0.1) 78%,
			rgba(0, 0, 0, 0.03) 90%,
			transparent 100%
		);
		/* Smooth animation for any dynamic changes */
		transition: opacity 0.3s ease-out;
	}

	/* Adjust for mobile screens */
	@media (max-width: 640px) {
		.depth-of-field-overlay {
			height: 120px;
		}
	}
</style>
