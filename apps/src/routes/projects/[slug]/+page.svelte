<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const project = data.project;

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
</script>

<svelte:head>
	<title>{project.name} - Helmy Luqmanulhakim</title>
</svelte:head>

<main
	class="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 md:py-24 min-h-screen text-neutral-900 font-sans overflow-x-hidden"
>
	<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-24">
		<div class="md:col-span-7 lg:col-span-8">
			<header class="mb-12 md:mb-16">
				<a
					href="/projects"
					class="text-xs text-neutral-400 hover:text-neutral-900 mb-6 md:mb-8 inline-block transition-colors"
				>
					← Back to projects
				</a>
				<h1
					class="text-3xl sm:text-4xl font-medium tracking-tight leading-[1.15] text-neutral-950 mb-6"
				>
					{project.name}
				</h1>
				<p class="text-lg text-neutral-500 leading-relaxed font-light">
					{project.description}
				</p>
			</header>

			{#if project.html && project.html.trim() !== ''}
				<article class="project-content">
					{@html project.html}
				</article>
			{:else}
				<div class="text-sm text-neutral-400 italic border-l-2 border-neutral-200 pl-4 py-1">
					Additional details available in the repository.
				</div>
			{/if}
		</div>

		<aside class="md:col-span-5 lg:col-span-4 md:pl-6 lg:pl-12 xl:pl-24 space-y-8 md:space-y-12 pt-8 md:pt-0 border-t border-neutral-100 md:border-t-0 mt-12 md:mt-0 min-w-0">
			<div class="md:sticky md:top-24 space-y-8 md:space-y-12">
				<div class="flex gap-3 md:gap-4">
					{#if project.github}
						<a
							href={project.github}
							target="_blank"
							class="flex-1 py-2.5 md:py-3 text-center border border-neutral-200 rounded-sm text-sm font-medium hover:border-neutral-900 hover:text-neutral-900 transition-colors"
						>
							View Code
						</a>
					{/if}
					{#if project.demo}
						<a
							href={project.demo}
							target="_blank"
							class="flex-1 py-2.5 md:py-3 text-center bg-neutral-900 text-white rounded-sm text-sm font-medium hover:bg-neutral-800 transition-colors"
						>
							Live Demo
						</a>
					{/if}
				</div>

				<dl class="grid grid-cols-2 gap-4 md:block md:space-y-8 text-sm">
					{#if project.date}
						<div>
							<dt class="text-neutral-400 text-xs mb-1.5 uppercase tracking-wide">Date</dt>
							<dd class="text-neutral-900 font-mono">
								{new Date(project.date).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'short'
								})}
							</dd>
						</div>
					{/if}

					{#if project.stacks && project.stacks.length > 0}
						<div class="col-span-2 md:col-span-1">
							<dt class="text-neutral-400 text-xs mb-3 uppercase tracking-wide">Technologies</dt>
							<dd class="flex flex-wrap gap-2 md:flex-col md:gap-2">
								{#each project.stacks as stack}
									<span class="text-neutral-600 md:border-b md:border-neutral-100 md:pb-1 text-xs md:text-sm px-2 py-1 md:px-0 md:py-0 border border-neutral-200 md:border-0 rounded-sm md:rounded-none bg-neutral-50 md:bg-transparent"
										>{stack}</span
									>
								{/each}
							</dd>
						</div>
					{/if}
				</dl>
			</div>
		</aside>
	</div>
</main>
<Footer />

<style>
	/* Project Content Styling
	   Matches the architectural prose style of the writings section.
	*/

	:global(.project-content) {
		color: #525252; /* Neutral-600 */
	}

	/* HEADINGS */
	:global(.project-content h2) {
		color: #0a0a0a;
		margin-top: 3.5rem;
		margin-bottom: 1.25rem;
		font-size: 1.25rem;
		line-height: 1.3;
		font-weight: 500;
		letter-spacing: -0.015em;
	}

	@media (min-width: 640px) {
		:global(.project-content h2) {
			font-size: 1.5rem;
			margin-top: 4rem;
			margin-bottom: 1.5rem;
		}
	}

	:global(.project-content h3) {
		color: #171717;
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		font-size: 1.125rem;
		line-height: 1.35;
		font-weight: 500;
	}

	/* PARAGRAPHS */
	:global(.project-content p) {
		margin-bottom: 1.5rem;
		line-height: 1.75;
		font-weight: 400;
	}

	@media (min-width: 640px) {
		:global(.project-content p) {
			line-height: 1.85;
		}
	}

	/* LINKS */
	:global(.project-content a) {
		color: #171717;
		font-weight: 500;
		text-decoration: underline;
		text-decoration-color: #d4d4d4;
		text-underline-offset: 4px;
		transition: all 0.2s;
	}

	:global(.project-content a:hover) {
		text-decoration-color: #171717;
	}

	/* LISTS */
	:global(.project-content ul),
	:global(.project-content ol) {
		margin-bottom: 1.5rem;
		padding-left: 1.25rem;
		color: #525252;
	}

	:global(.project-content ul) {
		list-style-type: disc;
	}
	:global(.project-content ol) {
		list-style-type: decimal;
	}

	:global(.project-content li) {
		margin-bottom: 0.5rem;
		padding-left: 0.25rem;
		line-height: 1.75;
	}

	:global(.project-content li::marker) {
		color: #d4d4d4;
	}

	/* IMAGES */
	:global(.project-content img) {
		width: 100%;
		border-radius: 2px;
		margin-top: 2rem;
		margin-bottom: 2rem;
		display: block;
		border: 1px solid #f5f5f5;
	}

	/* CODE BLOCKS */
	:global(.project-content pre) {
		background-color: #171717;
		color: #fafafa;
		padding: 1.25rem;
		border-radius: 2px;
		overflow-x: auto;
		margin: 2rem 0;
		font-size: 0.8125rem;
		line-height: 1.6;
		border: 1px solid #262626;
	}

	@media (min-width: 640px) {
		:global(.project-content pre) {
			padding: 1.5rem;
			font-size: 0.875rem;
		}
	}

	:global(.project-content code) {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.85em;
		color: #171717;
		background-color: #f5f5f5;
		padding: 0.125rem 0.375rem;
		border-radius: 2px;
	}

	:global(.project-content pre code) {
		background-color: transparent;
		color: inherit;
		padding: 0;
	}

	:global(.project-content code::before),
	:global(.project-content code::after) {
		content: none !important;
	}
</style>
