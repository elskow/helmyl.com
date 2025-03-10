<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const project = data.project;
	const breadcrumbPath = `projects/${project.slug}`;

	function executePostScripts() {
		const scripts = document.querySelectorAll('.project-content script');
		scripts.forEach((script) => {
			const newScript = document.createElement('script');
			newScript.textContent = script.textContent;
			script.replaceWith(newScript);
		});
	}

	onMount(() => {
		executePostScripts();
	});

	$effect(() => {
		executePostScripts();
	});

	const projectUrl = `https://helmyl.com/projects/${project.slug}`;
</script>

<svelte:head>
	<title>{project.name} | Helmy Luqmanulhakim Projects</title>
	<meta
		name="description"
		content={project.description ||
			`Detailed breakdown of ${project.name}, including technologies used, implementation details, and outcomes.`}
	/>
	<meta
		name="keywords"
		content={project.stacks
			? project.stacks.join(', ') + ', project, Helmy Luqmanulhakim'
			: 'software project, development, Helmy Luqmanulhakim'}
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" />
	<meta property="og:url" content={projectUrl} />
	<meta property="og:title" content={project.name} />
	<meta property="og:description" content={project.description} />
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />
	{#if project.image}
		<meta property="og:image" content={project.image} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:url" content={projectUrl} />
	<meta name="twitter:title" content={project.name} />
	<meta name="twitter:description" content={project.description} />
	{#if project.image}
		<meta name="twitter:image" content={project.image} />
	{/if}

	<link rel="canonical" href={projectUrl} />
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4">
	<Breadcrumbs path={breadcrumbPath} />

	<article class="pt-8 space-y-6 text-sm sm:text-base">
		<header class="border-b border-dark-200 dark:border-midnight-700 pb-6">
			<h1 class="text-2xl font-semibold text-midnight-800 dark:text-dark-100">{project.name}</h1>

			<p class="mt-4 text-dark-600 dark:text-dark-300 leading-relaxed">{project.description}</p>

			<div class="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
				<div class="flex flex-wrap gap-2">
					{#if project.stacks && project.stacks.length > 0}
						{#each project.stacks as stack}
							<span
								class="bg-dark-100 dark:bg-midnight-800 text-xs px-3 py-1.5 rounded font-medium"
							>
								{stack}
							</span>
						{/each}
					{/if}
				</div>

				<p class="text-sm text-dark-500 dark:text-dark-400">
					{project.date
						? new Date(project.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long'
							})
						: 'Date not available'}
				</p>
			</div>

			<div class="mt-6 flex gap-3">
				{#if project.github}
					<a
						href={project.github}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 bg-dark-100 dark:bg-midnight-800 hover:bg-dark-200 dark:hover:bg-midnight-700 text-midnight-800 dark:text-dark-100 px-4 py-2 rounded-md transition-colors duration-200"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path
								d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
							/>
						</svg>
						View on GitHub
					</a>
				{/if}
				{#if project.demo}
					<a
						href={project.demo}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 bg-azure-100 dark:bg-azure-900/30 hover:bg-azure-200 dark:hover:bg-azure-900/50 text-azure-800 dark:text-azure-300 px-4 py-2 rounded-md transition-colors duration-200"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path
								d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"
							/>
							<path
								d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"
							/>
						</svg>
						Live Demo
					</a>
				{/if}
			</div>
		</header>

		{#if project.html && project.html.trim() !== ''}
			<div
				class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pr-2 pt-6 pb-8 project-content dark:prose-invert prose-a:text-azure-600 dark:prose-a:text-azure-400 prose-img:rounded-lg prose-img:shadow-md"
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html project.html}
			</div>
		{:else}
			<div class="pt-6 text-dark-600 dark:text-dark-400 italic">
				No additional details available for this project.
			</div>
		{/if}

		{#if project.lastModified}
			<p
				class="text-xs sm:text-sm text-dark-500 dark:text-dark-400 text-right font-light border-t border-dark-200 dark:border-midnight-700 pt-4"
			>
				Last modified on {new Date(project.lastModified).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
		{/if}
	</article>
</main>
<Footer />
