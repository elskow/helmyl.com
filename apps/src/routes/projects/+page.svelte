<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const projects = data.projects;
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

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4">
	<Breadcrumbs path="projects" />

	<article class="pt-8 space-y-4 text-sm sm:text-base">
		<div class="mt-4 sm:grid-cols-3 grid gap-2 grid-cols-2">
			{#each projects as project}
				<ProjectCard {...project} />
			{/each}
		</div>
	</article>
</main>
<Footer />
