<script lang="ts">
	interface Props {
		name: string;
		description: string;
		github: string;
		stacks: string[];
		slug: string;
	}

	let { name, description, github, stacks, slug }: Props = $props();
	let isHovered = false;

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}
</script>

<article
	class="relative overflow-hidden border border-dark-300/50 dark:border-dark-500/60 rounded-lg shadow-sm hover:shadow-md p-5 transition-all duration-300 hover:border-azure-500/50 dark:hover:border-azure-400/40 group bg-white/50 dark:bg-midnight-900/10"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
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
		class="flex flex-wrap gap-1.5 pt-2 justify-end pb-2 relative z-10"
		aria-label="Technologies used"
	>
		{#each stacks as tech}
			<li
				class="text-xs px-2 py-0.5 bg-dark-100/30 dark:bg-midnight-700/70 rounded-full transition-all duration-300 group-hover:bg-dark-200/50 dark:group-hover:bg-midnight-600/90 text-dark-700 dark:text-dark-200"
			>
				{tech}
			</li>
		{/each}
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

	<!-- Hover effect overlay -->
	<div
		class="absolute inset-0 bg-gradient-to-t from-azure-500/5 dark:from-azure-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
	></div>

	<!-- Decorative dots pattern -->
	<div
		class="absolute -bottom-15 right-0 w-16 h-16 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"
	>
		<div class="grid grid-cols-3 gap-1">
			{#each Array(9) as _, i}
				<div class="w-1 h-1 rounded-full bg-current"></div>
			{/each}
		</div>
	</div>

	<!-- Animated border highlight -->
	<div
		class="absolute bottom-0 left-0 w-0 h-0.5 bg-azure-500/70 dark:bg-azure-400/80 group-hover:w-full transition-all duration-700 ease-out"
	></div>
</article>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	a {
		transition: all 0.2s ease-in-out;
	}

	h3 {
		transition:
			color 0.2s ease-in-out,
			text-decoration 0.2s ease-in-out;
	}

	article {
		backdrop-filter: blur(8px);
		position: relative;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.05),
			0 2px 4px -1px rgba(0, 0, 0, 0.03);
	}

	article:hover {
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.08),
			0 4px 6px -2px rgba(0, 0, 0, 0.04);
		transform: translateY(-2px);
	}

	:global(.dark) article {
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	:global(.dark) article:hover {
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.2),
			0 4px 6px -2px rgba(0, 0, 0, 0.15);
	}

	article::before {
		content: '';
		position: absolute;
		top: -1px;
		left: -1px;
		right: -1px;
		bottom: -1px;
		z-index: -1;
		background: linear-gradient(45deg, transparent 70%, rgba(59, 130, 246, 0.1) 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	:global(.dark) article::before {
		background: linear-gradient(45deg, transparent 70%, rgba(96, 165, 250, 0.15) 100%);
	}

	article:hover::before {
		opacity: 1;
	}
</style>
