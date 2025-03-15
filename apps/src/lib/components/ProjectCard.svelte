<script lang="ts">
	import { ExternalLink, Search } from '@lucide/svelte';
	import { browser } from '$app/environment';

	interface Props {
		name: string;
		description: string;
		github: string;
		stacks: string[];
		slug: string;
	}

	let { name, description, github, stacks, slug }: Props = $props();

	const visibleStacks = $derived(stacks.slice(0, 3));
	const remainingCount = $derived(stacks.length > 3 ? stacks.length - 3 : 0);

	let isTouchDevice = $state(false);

	if (browser) {
		isTouchDevice = window.matchMedia('(hover: none)').matches;
	}
</script>

<article
	class="project-card relative overflow-hidden border border-dark-300/50 dark:border-dark-500/60 rounded-lg shadow-sm p-4 sm:p-5 transition-all {isTouchDevice
		? 'touch-duration'
		: 'duration-300'} hover:border-azure-500/50 dark:hover:border-azure-400/40 group bg-white/50 dark:bg-midnight-900/10 {isTouchDevice
		? 'touch-device'
		: ''}"
>
	<a href={`/projects/${slug}`} class="block relative z-10">
		<h3
			class="font-semibold text-midnight-800 dark:text-dark-100 ease-in-out transition-colors {isTouchDevice
				? 'touch-duration'
				: 'duration-200'} text-sm sm:text-base group-hover:text-azure-600 dark:group-hover:text-azure-400 flex items-center"
		>
			{name}
		</h3>
		<p class="line-clamp-3 text-xs sm:text-sm mt-2 mb-3 text-dark-600 dark:text-dark-300">
			{description}
		</p>
	</a>

	<ul
		class="flex flex-wrap gap-1.5 pt-2 justify-end pb-2 relative z-10 pl-6 sm:pl-10 text-right"
		aria-label="Technologies used"
	>
		{#each visibleStacks as tech}
			<li
				class="text-xs px-2 py-0.5 bg-dark-100/30 dark:bg-midnight-700/70 rounded-full transition-all {isTouchDevice
					? 'touch-duration'
					: 'duration-300'} group-hover:bg-dark-200/50 dark:group-hover:bg-midnight-600/90 text-dark-700 dark:text-dark-200"
			>
				{tech}
			</li>
		{/each}
		{#if remainingCount > 0}
			<li
				class="text-xs px-2 py-0.5 bg-dark-200/40 dark:bg-midnight-600/80 rounded-full transition-all {isTouchDevice
					? 'touch-duration'
					: 'duration-300'} group-hover:bg-dark-300/60 dark:group-hover:bg-midnight-500/90 text-dark-700 dark:text-dark-200"
				title={stacks.slice(3).join(', ')}
			>
				+{remainingCount}
			</li>
		{/if}
	</ul>

	<footer class="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 flex gap-3 z-10">
		<a
			class="cursor-alias transition-all {isTouchDevice
				? 'touch-duration'
				: 'duration-200'} ease-in-out hover:text-azure-600 dark:hover:text-azure-400 {isTouchDevice
				? ''
				: 'hover:scale-110'} {isTouchDevice ? 'touch-link' : ''}"
			href={github}
			rel="noopener noreferrer"
			target="_blank"
			title="View on GitHub"
			aria-label={`View ${name} on GitHub`}
		>
			<ExternalLink size="1em" />
		</a>
		<a
			class="cursor-pointer transition-all {isTouchDevice
				? 'touch-duration'
				: 'duration-200'} ease-in-out hover:text-azure-600 dark:hover:text-azure-400 {isTouchDevice
				? ''
				: 'hover:scale-110'} {isTouchDevice ? 'touch-link' : ''}"
			href={`/projects/${slug}`}
			title="View details"
			aria-label={`View details for ${name} project`}
		>
			<Search size="1em" />
		</a>
	</footer>

	<div class="card-effects"></div>
</article>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.project-card {
		backdrop-filter: blur(8px);
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.05),
			0 2px 4px -1px rgba(0, 0, 0, 0.03);
		will-change: transform, box-shadow;
	}

	.project-card:hover {
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.08),
			0 4px 6px -2px rgba(0, 0, 0, 0.04);
		transform: translateY(-2px);
	}

	:global(.dark) .project-card {
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	:global(.dark) .project-card:hover {
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.2),
			0 4px 6px -2px rgba(0, 0, 0, 0.15);
	}

	.card-effects {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.card-effects::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(59, 130, 246, 0.05) 0%, transparent 30%);
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: -1;
	}

	.project-card:hover .card-effects::before {
		opacity: 1;
	}

	.card-effects::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		height: 2px;
		width: 0;
		background: rgba(59, 130, 246, 0.7);
		transition: width 0.7s ease-out;
	}

	.project-card:hover .card-effects::after {
		width: 100%;
	}

	:global(.dark) .card-effects::before {
		background: linear-gradient(to top, rgba(96, 165, 250, 0.1) 0%, transparent 30%);
	}

	:global(.dark) .card-effects::after {
		background: rgba(96, 165, 250, 0.8);
	}

	a,
	h3 {
		transition: all 0.2s ease-in-out;
	}

	.touch-device {
		will-change: auto;
	}

	.touch-device:active {
		background-color: rgba(59, 130, 246, 0.05);
	}

	.touch-device .card-effects::before {
		opacity: 0.3;
	}

	.touch-device .card-effects::after {
		width: 30%;
	}

	.touch-device:active .card-effects::after {
		width: 100%;
	}

	.touch-link {
		padding: 10px;
		margin: -10px;
	}

	.touch-duration {
		transition-duration: 0.1s;
	}

	.touch-device * {
		transition-duration: 0.1s;
	}

	.touch-device:hover {
		transform: none;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.05),
			0 2px 4px -1px rgba(0, 0, 0, 0.03);
	}

	:global(.dark) .touch-device:hover {
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.touch-device:active {
		transform: translateY(-1px);
	}

	@media (max-width: 640px) {
		.project-card {
			contain: content;
			content-visibility: auto;
		}

		.touch-link {
			padding: 12px;
			margin: -12px;
		}
	}
</style>
