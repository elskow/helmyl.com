<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { onMount } from 'svelte';

	interface Props {
		data: import('./$types').PageData;
	}

	interface Project {
		name: string;
		description: string;
		github: string;
		stacks: string[];
		date: string;
		priority?: number;
		slug: string;
		lastModified: string;
		html: string;
	}

	let { data }: Props = $props();
	const projects = data.projects as Project[];
	let isPageLoaded = false;

	// Group projects by year
	const projectsByYear = projects.reduce(
		(acc, project: Project) => {
			const year = new Date(project.date).getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(project);
			return acc;
		},
		{} as Record<number, Project[]>
	);

	// Sort years in descending order
	const sortedYears = Object.keys(projectsByYear)
		.map(Number)
		.sort((a, b) => b - a);

	onMount(() => {
		isPageLoaded = true;
	});
</script>

<svelte:head>
	<title>Projects Portfolio | Helmy Luqmanulhakim</title>
	<meta
		name="description"
		content="Explore my software development projects spanning web applications, data engineering, and technical solutions."
	/>
	<meta
		name="keywords"
		content="software projects, web development portfolio, coding projects, Helmy Luqmanulhakim work"
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://helmyl.com/projects" />
	<meta property="og:title" content="Projects Portfolio | Helmy Luqmanulhakim" />
	<meta
		property="og:description"
		content="Explore my software development projects spanning web applications, data engineering, and technical solutions."
	/>
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://helmyl.com/projects" />
	<meta name="twitter:title" content="Projects Portfolio | Helmy Luqmanulhakim" />
	<meta
		name="twitter:description"
		content="Explore my software development projects spanning web applications, data engineering, and technical solutions."
	/>

	<link rel="canonical" href="https://helmyl.com/projects" />
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4 relative">
	<Breadcrumbs path="projects" />

	<header class="mb-8 md:mb-12 mt-4 md:mt-6">
		<h1 class="text-2xl md:text-3xl font-bold relative inline-block">
			Projects Portfolio
			<div
				class="absolute -bottom-1 left-0 w-1/3 h-1 bg-gradient-to-r from-azure-500/70 dark:from-azure-400/70 to-transparent rounded-full"
			></div>
		</h1>
		<p class="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mt-4">
			A collection of software development projects I've worked on over the years.
		</p>
	</header>

	<div class="space-y-12 md:space-y-20">
		{#each sortedYears as year, i}
			<section
				class="relative {isPageLoaded ? 'animate-fade-in' : ''}"
				style="animation-delay: {i * 100}ms"
			>
				<div class="flex items-center mb-4 md:mb-8">
					<h2
						class="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-200 flex items-center"
					>
						<span class="relative">
							{year}
							<span
								class="absolute -left-2 -right-2 bottom-0 h-[6px] bg-azure-500/10 dark:bg-azure-400/20 -z-10 rounded-sm"
							></span>
						</span>
					</h2>
					<div
						class="ml-3 md:ml-4 h-[1px] flex-grow bg-gradient-to-r from-zinc-300 dark:from-zinc-600 to-transparent"
					></div>
					<span
						class="ml-2 md:ml-3 text-xs md:text-sm text-zinc-500 dark:text-zinc-300 font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/70"
					>
						{projectsByYear[year].length} project{projectsByYear[year].length !== 1 ? 's' : ''}
					</span>
				</div>

				<ul
					class="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
					aria-label="Projects from {year}"
				>
					{#each projectsByYear[year] as project, j}
						<ProjectCard {...project} />
					{/each}
				</ul>
			</section>
		{/each}
	</div>

	<!-- Decorative corner element -->
	<div class="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-30 dark:opacity-40">
		<svg
			width="100"
			height="100"
			viewBox="0 0 100 100"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M0 0L100 0L100 100" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" />
			<circle cx="70" cy="30" r="4" fill="currentColor" opacity="0.5" />
			<circle cx="30" cy="70" r="2" fill="currentColor" opacity="0.3" />
		</svg>
	</div>
</main>
<Footer />

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fadeIn 0.6s ease-out forwards;
	}

	.animate-slide-up {
		animation: slideUp 0.5s ease-out forwards;
	}

	:global(body) {
		position: relative;
	}
</style>
