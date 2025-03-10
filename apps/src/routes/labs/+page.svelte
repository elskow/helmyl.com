<script lang="ts">
	import type { LabProject } from '$lib/types/labs';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	interface Props {
		data: { projects: LabProject[] };
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Interactive Labs & Experiments | Helmy Luqmanulhakim</title>
	<meta
		name="description"
		content="Explore my hands-on experiments, interactive demos, and technical labs showcasing various technologies in action."
	/>
	<meta
		name="keywords"
		content="web experiments, interactive demos, tech labs, code playground, Helmy Luqmanulhakim"
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://helmyl.com/labs" />
	<meta property="og:title" content="Interactive Labs & Experiments | Helmy Luqmanulhakim" />
	<meta
		property="og:description"
		content="Explore my hands-on experiments, interactive demos, and technical labs showcasing various technologies in action."
	/>
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:url" content="https://helmyl.com/labs" />
	<meta name="twitter:title" content="Interactive Labs & Experiments | Helmy Luqmanulhakim" />
	<meta
		name="twitter:description"
		content="Explore my hands-on experiments, interactive demos, and technical labs showcasing various technologies in action."
	/>

	<link rel="canonical" href="https://helmyl.com/labs" />
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4">
	<Breadcrumbs path="labs" />

	<div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each data.projects as project}
			<div
				class="border border-dark-200 dark:border-midnight-700 p-4 rounded-lg transition-all duration-300 hover:border-azure-500/50 dark:hover:border-azure-500/30 hover:shadow-md group relative overflow-hidden"
			>
				<div
					class="absolute inset-0 bg-gradient-to-t from-azure-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
				></div>

				<a
					href={`/labs/${project.slug}`}
					class="block h-full w-full absolute inset-0 z-10"
					aria-label={`View ${project.name} project`}
				>
					<span class="sr-only">View {project.name}</span>
				</a>

				<h2
					class="text-lg font-semibold text-midnight-800 dark:text-dark-100 group-hover:text-azure-600 dark:group-hover:text-azure-400 transition-colors duration-200 relative z-0"
				>
					{project.name}
				</h2>
				<p class="text-sm text-dark-600 dark:text-dark-300 relative z-0">{project.description}</p>
				<div class="mt-2 text-xs text-dark-500 dark:text-dark-400 relative z-0">
					{#if project.author}
						<p>By {project.author}</p>
					{/if}
					<p>Version {project.version}</p>
				</div>
				<div
					class="mt-2 inline-flex items-center text-azure-600 dark:text-azure-400 hover:underline transition-all duration-200 relative z-0 pointer-events-none"
				>
					<span>View Project</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
			</div>
		{/each}
	</div>
</main>
<Footer />
