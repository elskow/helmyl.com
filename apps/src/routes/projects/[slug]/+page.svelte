<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import { CornerRightUp, Calendar, Github, Link2 } from '@lucide/svelte';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const project = data.project;
	const breadcrumbPath = `projects/${project.slug}`;
	let isPageLoaded = $state(false);

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
		isPageLoaded = true;
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

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4 relative">
	<Breadcrumbs path={breadcrumbPath} />

	<!-- Decorative corner element -->
	<div
		class="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-20 flex items-center justify-center"
	>
		<svg
			width="90"
			height="90"
			viewBox="0 0 100 100"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="transform -translate-x-1 -translate-y-1"
		>
			<path d="M5 5L95 5L95 95" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" />
			<circle cx="70" cy="30" r="4" fill="currentColor" opacity="0.5" />
			<circle cx="30" cy="70" r="2" fill="currentColor" opacity="0.3" />
		</svg>
	</div>

	<article class="pt-8 space-y-6 text-sm sm:text-base {isPageLoaded ? 'animate-fade-in' : ''}">
		<header class="border-b border-dark-200 pb-6 relative">
			<h1 class="text-2xl md:text-3xl font-semibold text-midnight-800">
				{project.name}
			</h1>
			<!-- Decorative accent line -->
			<div
				class="w-16 h-1 bg-gradient-to-r from-azure-500/70 to-transparent rounded-full mb-4"
			></div>

			<p class="mt-4 text-dark-600 leading-relaxed">{project.description}</p>

			<div class="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
				<ul class="flex flex-wrap gap-2" aria-label="Technologies used">
					{#if project.stacks && project.stacks.length > 0}
						{#each project.stacks as stack}
							<li
								class="bg-dark-100/70 text-xs px-3 py-1.5 rounded-full font-medium text-dark-700 hover:bg-dark-200/70 transition-colors duration-200 cursor-pointer"
							>
								{stack}
							</li>
						{/each}
					{/if}
				</ul>

				<time
					datetime={project.date ? new Date(project.date).toISOString() : ''}
					class="text-sm text-dark-500 flex items-center"
				>
					<Calendar class="w-3.5 h-3.5 mr-1.5 opacity-70" />
					{project.date
						? new Date(project.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long'
							})
						: 'Date not available'}
				</time>
			</div>

			<nav class="mt-6 flex gap-3" aria-label="Project links">
				{#if project.github}
					<a
						href={project.github}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 bg-dark-100/80 hover:bg-dark-200/80 text-midnight-800 px-4 py-2 rounded-md transition-all duration-200 hover:shadow-sm"
						aria-label="View project source code on GitHub"
					>
						<Github size={16} />
						View on GitHub
					</a>
				{/if}
				{#if project.demo}
					<a
						href={project.demo}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 bg-azure-100/80 hover:bg-azure-200/80 text-azure-800 px-4 py-2 rounded-md transition-all duration-200 hover:shadow-sm"
						aria-label="View live demo of the project"
					>
						<Link2 size={16} />
						Live Demo
					</a>
				{/if}
			</nav>
		</header>

		{#if project.html && project.html.trim() !== ''}
			<section
				class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pr-2 pt-6 pb-8 project-content prose-a:text-azure-600 prose-img:rounded-lg prose-img:shadow-md relative"
				aria-label="Project details"
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html project.html}
			</section>
		{:else}
			<section class="pt-6 text-dark-600 italic" aria-label="Project details">
				No additional details available for this project.
			</section>
		{/if}

		{#if project.lastModified}
			<footer
				class="text-xs sm:text-sm text-dark-500 text-right font-light border-t border-dark-200 pt-4"
			>
				<time datetime={new Date(project.lastModified).toISOString()}>
					Last modified on {new Date(project.lastModified).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</time>
			</footer>
		{/if}
	</article>
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

	.animate-fade-in {
		animation: fadeIn 0.8s ease-out forwards;
	}

	:global(.project-content h2) {
		position: relative;
		display: inline-block;
	}

	:global(.project-content h2::after) {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		width: 40%;
		height: 2px;
		background: linear-gradient(to right, rgba(59, 130, 246, 0.5), transparent);
		border-radius: 9999px;
	}

	:global(.dark .project-content h2::after) {
		background: linear-gradient(to right, rgba(96, 165, 250, 0.5), transparent);
	}
</style>
