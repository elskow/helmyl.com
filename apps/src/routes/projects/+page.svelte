<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

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

	// Group projects by year
	const groupedProjects = projects.reduce(
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

	// Sort years in descending order (newest first)
	const sortedYears = Object.entries(groupedProjects).sort(([a], [b]) => Number(b) - Number(a));
</script>

<svelte:head>
	<title>Projects - Helmy Luqmanulhakim</title>
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

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 min-h-screen">
	<Breadcrumbs path="projects" />

	<h1 class="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 tracking-tight">
		Projects
	</h1>
	<p class="text-xs sm:text-sm md:text-base text-dark-600 mb-8 sm:mb-10 md:mb-12 leading-relaxed">
		A collection of software development projects I've worked on over the years.
	</p>

	<div class="space-y-12 sm:space-y-16 md:space-y-20">
		{#each sortedYears as [year, projects]}
			<section>
				<div class="flex items-center gap-4 mb-6 sm:mb-8">
					<h2
						class="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-midnight-800"
					>
						{year}
					</h2>
					<div class="flex-1 h-px bg-dark-200"></div>
				</div>
				<div class="space-y-6 sm:space-y-8">
					{#each projects as project}
						<ProjectCard {...project} />
					{/each}
				</div>
			</section>
		{/each}
	</div>
</div>
<Footer />
