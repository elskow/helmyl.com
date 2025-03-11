<script lang="ts">
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
</script>

<article
	class="project-card relative overflow-hidden border border-dark-300/50 dark:border-dark-500/60 rounded-lg shadow-sm p-5 transition-all duration-300 hover:border-azure-500/50 dark:hover:border-azure-400/40 group bg-white/50 dark:bg-midnight-900/10"
>
	<a href={`/projects/${slug}`} class="block relative z-10">
		<h3
			class="font-semibold text-midnight-800 dark:text-dark-100 ease-in-out transition-colors duration-200 text-sm sm:text-base group-hover:text-azure-600 dark:group-hover:text-azure-400 flex items-center"
		>
			{name}
		</h3>
		<p class="line-clamp-3 text-xs sm:text-sm mt-2 mb-3 text-dark-600 dark:text-dark-300">
			{description}
		</p>
	</a>

	<ul
		class="flex flex-wrap gap-1.5 pt-2 justify-end pb-2 relative z-10 pl-10 text-right"
		aria-label="Technologies used"
	>
		{#each visibleStacks as tech}
			<li
				class="text-xs px-2 py-0.5 bg-dark-100/30 dark:bg-midnight-700/70 rounded-full transition-all duration-300 group-hover:bg-dark-200/50 dark:group-hover:bg-midnight-600/90 text-dark-700 dark:text-dark-200"
			>
				{tech}
			</li>
		{/each}
		{#if remainingCount > 0}
			<li
				class="text-xs px-2 py-0.5 bg-dark-200/40 dark:bg-midnight-600/80 rounded-full transition-all duration-300 group-hover:bg-dark-300/60 dark:group-hover:bg-midnight-500/90 text-dark-700 dark:text-dark-200"
				title={stacks.slice(3).join(', ')}
			>
				+{remainingCount}
			</li>
		{/if}
	</ul>

	<footer class="absolute bottom-4 left-4 flex gap-3 z-10">
		<a
			class="cursor-alias transition-all duration-200 ease-in-out hover:text-azure-600 dark:hover:text-azure-400 hover:scale-110"
			href={github}
			rel="noopener noreferrer"
			target="_blank"
			title="View on GitHub"
			aria-label={`View ${name} on GitHub`}
		>
			<svg
				aria-hidden="true"
				class="iconify iconify--akar-icons"
				font-size="16"
				height="1em"
				preserveAspectRatio="xMidYMid meet"
				role="img"
				viewBox="0 0 24 24"
				width="1em"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M13.5 10.5L21 3m-5 0h5v5m0 6v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
				></path>
			</svg>
		</a>
		<a
			class="cursor-pointer transition-all duration-200 ease-in-out hover:text-azure-600 dark:hover:text-azure-400 hover:scale-110"
			href={`/projects/${slug}`}
			title="View details"
			aria-label={`View details for ${name} project`}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="1em"
				height="1em"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle cx="11" cy="11" r="8"></circle>
				<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
			</svg>
		</a>
	</footer>

	<div class="card-effects"></div>
</article>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.project-card {
		backdrop-filter: blur(8px);
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.05),
			0 2px 4px -1px rgba(0, 0, 0, 0.03);
		will-change: transform, box-shadow; /* Hint for browser optimization */
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

	/* Combine all decorative effects into one element with pseudo-elements */
	.card-effects {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	/* Gradient overlay */
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

	/* Animated border */
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

	/* Simplified transitions */
	a,
	h3 {
		transition: all 0.2s ease-in-out;
	}
</style>
