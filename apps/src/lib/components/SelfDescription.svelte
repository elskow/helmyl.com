<script lang="ts">
	interface Props {
		attributes?: string[];
	}

	let { attributes = [] }: Props = $props();
	const longestAttribute = attributes.reduce((a, b) => (a.length > b.length ? a : b), '');
</script>

{#snippet renderDescription()}
	<span class="text-azure-600 dark:text-azure-400 animated-wrapper">
		<span class="placeholder" aria-hidden="true">{longestAttribute}.</span>

		{#each attributes as attribute, i}
			<span class="animated-word" style="animation-delay: {i * 1.5}s;">{attribute}.</span>
		{/each}
	</span>
{/snippet}

{@render renderDescription()}

<style>
	.animated-wrapper {
		position: relative;
		display: inline-block;
	}

	.placeholder {
		visibility: hidden;
		opacity: 0;
		user-select: none;
	}

	.animated-word {
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0;
		animation: cycle-words 6s infinite;
		will-change: transform, opacity;
		backface-visibility: hidden;
	}

	@keyframes cycle-words {
		0%,
		5% {
			opacity: 0;
			transform: translateY(10px);
			filter: blur(4px);
		}
		10% {
			filter: blur(2px);
		}
		15%,
		25% {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0px);
		}
		30% {
			filter: blur(1px);
		}
		35%,
		100% {
			opacity: 0;
			transform: translateY(-10px);
			filter: blur(4px);
		}
	}
	.animated-word:nth-child(2) {
		animation-delay: 0s;
	}
	.animated-word:nth-child(3) {
		animation-delay: 1.5s;
	}
	.animated-word:nth-child(4) {
		animation-delay: 3s;
	}
	.animated-word:nth-child(5) {
		animation-delay: 4.5s;
	}
</style>
