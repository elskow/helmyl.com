<script lang="ts">
	import { getBreadcrumbs } from '$lib/utils/breadcrumbs';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Footer from '$lib/components/Footer.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
	const projects = data.projects;
	const breadcrumbs = getBreadcrumbs('projects');
</script>

<svelte:head>
	<title>Helmy Luqmanulhakim</title>
	<meta name="description" content="A collection of projects that I've worked on." />
	<meta property="og:title" content="Projects" />
	<meta property="og:description" content="A collection of projects that I've worked on." />
	<meta property="og:url" content="https://helmyl.com" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4">
	<nav class="text-gray-600 dark:text-gray-400 font-medium text-sm line-clamp-1 pr-4">
		<a
			class="text-blue-800 dark:text-blue-400 hover:text-gray-800 dark:hover:text-gray-200 hover:text-bold cursor-pointer transition-colors duration-200 ease-in-out"
			href="/"
			title="home">home</a
		>
		<span class="mx-0.5 sm:mx-1">/</span>
		{#each breadcrumbs as breadcrumb, index}
			{#if !breadcrumb.isCurrent}
				<a
					href={breadcrumb.url}
					class="text-blue-800 dark:text-blue-400 hover:text-gray-800 dark:hover:text-gray-200 hover:text-bold cursor-pointer transition-colors duration-200 ease-in-out"
					title={breadcrumb.url}
				>
					{breadcrumb.name}
				</a>
			{:else}
				<span class="text-neutral-950 dark:text-neutral-200">{breadcrumb.name}</span>
			{/if}
			{#if index < breadcrumbs.length - 1}
				<span class="mx-1">/</span>
			{/if}
		{/each}
	</nav>

	<article class="pt-8 space-y-4 text-sm sm:text-base">
		<div class="mt-4 sm:grid-cols-3 grid gap-2 grid-cols-2">
			{#each projects as project}
				<ProjectCard {...project} />
			{/each}
		</div>
	</article>
</main>
<Footer />
