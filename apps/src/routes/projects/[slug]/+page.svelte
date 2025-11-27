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
	class="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 md:py-24 min-h-screen text-neutral-900 font-sans"
>
	<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-24">
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

				<div class="md:hidden border-t border-neutral-100 pt-6 mt-8 space-y-6">
					<div class="flex gap-3">
						{#if project.github}
							<a
								href={project.github}
								target="_blank"
								class="flex-1 py-2.5 text-center border border-neutral-200 rounded-sm text-sm font-medium hover:border-neutral-900 hover:text-neutral-900 transition-colors"
							>
								Code
							</a>
						{/if}
						{#if project.demo}
							<a
								href={project.demo}
								target="_blank"
								class="flex-1 py-2.5 text-center bg-neutral-900 text-white rounded-sm text-sm font-medium hover:bg-neutral-800 transition-colors"
							>
								Demo
							</a>
						{/if}
					</div>

					<div class="space-y-3 text-sm">
						{#if project.date}
							<div class="flex justify-between items-baseline">
								<span class="text-neutral-400 text-xs uppercase tracking-wide">Date</span>
								<span class="text-neutral-900 font-mono">
									{new Date(project.date).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long'
									})}
								</span>
							</div>
						{/if}

						{#if project.stacks && project.stacks.length > 0}
							<div class="pt-1">
								<span class="text-neutral-400 text-xs uppercase tracking-wide block mb-2"
									>Technologies</span
								>
								<div class="flex flex-wrap gap-2">
									{#each project.stacks as stack}
										<span
											class="text-xs border border-neutral-200 px-2 py-1 rounded-sm text-neutral-600 bg-neutral-50"
										>
											{stack}
										</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
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

			<nav class="md:hidden mt-16 pt-8 border-t border-neutral-100">
				<h3 class="text-xs text-neutral-400 mb-4 uppercase tracking-wide select-none">Menu</h3>
				<div class="flex gap-6 text-sm">
					<a href="/" class="text-neutral-600 hover:text-black transition-colors">Home</a>
					<a href="/projects" class="text-neutral-900 font-medium">All Projects</a>
				</div>
			</nav>
		</div>

		<div class="md:col-span-5 lg:col-span-4 md:pl-12 lg:pl-24 space-y-12 hidden md:block">
			<div class="sticky top-24 space-y-12">
				<div class="flex gap-4">
					{#if project.github}
						<a
							href={project.github}
							target="_blank"
							class="flex-1 py-3 text-center border border-neutral-200 rounded-sm text-sm font-medium hover:border-neutral-900 hover:text-neutral-900 transition-colors"
						>
							View Code
						</a>
					{/if}
					{#if project.demo}
						<a
							href={project.demo}
							target="_blank"
							class="flex-1 py-3 text-center bg-neutral-900 text-white rounded-sm text-sm font-medium hover:bg-neutral-800 transition-colors"
						>
							Live Demo
						</a>
					{/if}
				</div>

				<dl class="space-y-8 text-sm">
					{#if project.date}
						<div>
							<dt class="text-neutral-400 text-xs mb-1.5 uppercase tracking-wide">Date</dt>
							<dd class="text-neutral-900 font-mono">
								{new Date(project.date).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long'
								})}
							</dd>
						</div>
					{/if}

					{#if project.stacks && project.stacks.length > 0}
						<div>
							<dt class="text-neutral-400 text-xs mb-3 uppercase tracking-wide">Technologies</dt>
							<dd class="flex flex-col gap-2">
								{#each project.stacks as stack}
									<span class="text-neutral-600 border-b border-neutral-100 pb-1 w-full"
										>{stack}</span
									>
								{/each}
							</dd>
						</div>
					{/if}
				</dl>

				<nav class="border-t border-neutral-100 pt-8">
					<h3 class="text-xs text-neutral-400 mb-4 uppercase tracking-wide select-none">Menu</h3>
					<ul class="space-y-2 text-sm">
						<li>
							<a href="/" class="text-neutral-600 hover:text-black transition-colors block py-1">
								Home
							</a>
						</li>
						<li>
							<a href="/projects" class="text-neutral-900 font-medium block py-1"> All Projects </a>
						</li>
					</ul>
				</nav>
			</div>
		</div>
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
