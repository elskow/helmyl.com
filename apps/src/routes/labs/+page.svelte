<script lang="ts">
	import type { LabProject } from '$lib/types/labs';
	import type { PageData } from './$types';
	import Footer from '$lib/components/Footer.svelte';
	import { getBreadcrumbs } from '$lib/utils/breadcrumbs';
	import SEO from '$lib/components/SEO/index.svelte';

	export let data: { projects: LabProject[] };
	const breadcrumbs = getBreadcrumbs('labs');
</script>

<SEO
	title="Interactive Labs & Experiments"
	metadescription="Explore hands-on experiments and interactive demos showcasing various technologies and concepts in action. From WebGL visualizations to practical implementations."
/>

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
