<script lang="ts">
	interface Props {
		name: string;
		description: string;
		github: string;
		stacks: string[];
		slug: string;
	}

	let { name, description, github, stacks, slug }: Props = $props();
</script>

<article
	class="relative overflow-hidden border-2 border-dark-300/50 dark:border-dark-500/50 rounded-sm shadow-sm hover:shadow-md rounded-t-lg p-4 pb-8 transition-all duration-300 hover:border-azure-500/50 dark:hover:border-azure-500/30 group"
>
	<a href={`/projects/${slug}`} class="block">
		<h3
			class="font-semibold text-midnight-800 dark:text-dark-100 ease-in-out transition-colors duration-200 text-sm sm:text-base group-hover:text-azure-600 dark:group-hover:text-azure-400"
		>
			{name}
		</h3>
		<p class="line-clamp-3 text-xs sm:text-sm mb-2 text-dark-600 dark:text-dark-300">
			{description}
		</p>
	</a>
	<ul class="flex flex-wrap gap-2 pt-2 justify-end pb-2" aria-label="Technologies used">
		{#each stacks as tech}
			<li
				class="text-xs px-2 py-1 bg-dark-100/50 dark:bg-midnight-700/50 rounded-sm transition-all duration-300 group-hover:bg-dark-200/70 dark:group-hover:bg-midnight-600/70"
			>
				{tech}
			</li>
		{/each}
	</ul>
	<footer class="absolute bottom-4 left-4 flex gap-3">
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
		class="absolute inset-0 bg-gradient-to-t from-azure-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
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
</style>
