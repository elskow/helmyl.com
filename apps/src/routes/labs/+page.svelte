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
			<div class="border p-4 rounded-lg">
				<h2 class="text-lg font-semibold">{project.name}</h2>
				<p class="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
				<div class="mt-2 text-xs text-gray-500">
					{#if project.author}
						<p>By {project.author}</p>
					{/if}
					<p>Version {project.version}</p>
				</div>
				<a
					href={`/labs/${project.slug}`}
					class="mt-2 inline-block text-blue-600 dark:text-blue-400 hover:underline"
				>
					View Project →
				</a>
			</div>
		{/each}
	</div>
</main>
<Footer />
