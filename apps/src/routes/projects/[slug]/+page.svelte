<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import { Calendar, Github, Link2 } from '@lucide/svelte';

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
	const pageTitle = `${project.name} - Helmy Luqmanulhakim`;
	const pageDescription =
		project.description ||
		`Detailed breakdown of ${project.name}, including technologies used, implementation details, and outcomes.`;
	const ogImage = project.image || `https://helmyl.com/og/projects/${project.slug}.png`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta
		name="keywords"
		content={project.stacks
			? project.stacks.join(', ') + ', project, Helmy Luqmanulhakim'
			: 'software project, development, Helmy Luqmanulhakim'}
	/>
	<meta name="author" content="Helmy Luqmanulhakim" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" />
	<meta property="og:url" content={projectUrl} />
	<meta property="og:title" content={project.name} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:alt" content={project.name} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="en_US" />
	<meta property="article:author" content="Helmy Luqmanulhakim" />
	{#if project.stacks}
		{#each project.stacks as stack}
			<meta property="article:tag" content={stack} />
		{/each}
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={projectUrl} />
	<meta name="twitter:site" content="@helmyl" />
	<meta name="twitter:creator" content="@helmyl" />
	<meta name="twitter:title" content={project.name} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content={project.name} />

	<link rel="canonical" href={projectUrl} />

	<!-- Structured Data - Project -->
	<script type="application/ld+json">
		{JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'CreativeWork',
			name: project.name,
			description: pageDescription,
			image: ogImage,
			url: projectUrl,
			author: {
				'@type': 'Person',
				'@id': 'https://helmyl.com/#person',
				name: 'Helmy Luqmanulhakim',
				url: 'https://helmyl.com'
			},
			keywords: project.stacks ? project.stacks.join(', ') : undefined,
			inLanguage: 'en-US'
		})}
	</script>

	<!-- Structured Data - Breadcrumbs -->
	<script type="application/ld+json">
		{JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: 'Home',
					item: 'https://helmyl.com'
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: 'Projects',
					item: 'https://helmyl.com/projects'
				},
				{
					'@type': 'ListItem',
					position: 3,
					name: project.name,
					item: projectUrl
				}
			]
		})}
	</script>
</svelte:head>

<main class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 min-h-screen">
	<Breadcrumbs path={breadcrumbPath} />

	<article>
		<header class="mb-8 sm:mb-10 md:mb-12 pb-6 sm:pb-8 border-b border-dark-200">
			<h1 class="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 tracking-tight">
				{project.name}
			</h1>

			<p class="text-xs sm:text-sm text-dark-600 leading-relaxed mb-4 sm:mb-6">
				{project.description}
			</p>

			<div class="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
				{#if project.stacks && project.stacks.length > 0}
					{#each project.stacks as stack}
						<span
							class="bg-dark-100 text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-sm text-dark-700"
						>
							{stack}
						</span>
					{/each}
				{/if}
			</div>

			<div class="flex flex-wrap items-center gap-3 sm:gap-4">
				<time
					datetime={project.date ? new Date(project.date).toISOString() : ''}
					class="text-xs sm:text-sm text-dark-500 flex items-center gap-1.5"
				>
					<Calendar class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
					{project.date
						? new Date(project.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long'
							})
						: 'Date not available'}
				</time>

				{#if project.github}
					<a
						href={project.github}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-azure-600 hover:underline"
					>
						<Github class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						GitHub
					</a>
				{/if}
				{#if project.demo}
					<a
						href={project.demo}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-azure-600 hover:underline"
					>
						<Link2 class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						Demo
					</a>
				{/if}
			</div>
		</header>

		{#if project.html && project.html.trim() !== ''}
			<section
				class="prose prose-sm sm:prose-base md:prose-lg max-w-none
					prose-headings:text-midnight-800 prose-headings:font-semibold prose-headings:tracking-tight
					prose-h1:text-base sm:prose-h1:text-lg md:prose-h1:text-xl prose-h1:mt-8 sm:prose-h1:mt-10 md:prose-h1:mt-12 prose-h1:mb-4 sm:prose-h1:mb-5 md:prose-h1:mb-6 prose-h1:leading-tight
					prose-h2:text-base sm:prose-h2:text-lg md:prose-h2:text-xl prose-h2:mt-8 sm:prose-h2:mt-10 md:prose-h2:mt-12 prose-h2:mb-4 sm:prose-h2:mb-5 md:prose-h2:mb-6 prose-h2:leading-tight
					prose-h3:text-base sm:prose-h3:text-lg md:prose-h3:text-lg prose-h3:mt-6 sm:prose-h3:mt-8 md:prose-h3:mt-10 prose-h3:mb-3 sm:prose-h3:mb-4 md:prose-h3:mb-4
					prose-h4:text-sm sm:prose-h4:text-base md:prose-h4:text-base prose-h4:mt-6 sm:prose-h4:mt-7 md:prose-h4:mt-8 prose-h4:mb-2 sm:prose-h4:mb-3 md:prose-h4:mb-3
					prose-p:text-dark-600 prose-p:text-sm sm:prose-p:text-base md:prose-p:text-base prose-p:leading-relaxed prose-p:my-4 sm:prose-p:my-5 md:prose-p:my-6
					prose-a:text-azure-600 prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-azure-300 prose-a:hover:border-azure-600 prose-a:transition-colors
					prose-strong:text-midnight-800 prose-strong:font-semibold
					prose-code:text-azure-700 prose-code:bg-azure-50 prose-code:px-1 sm:prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-xs sm:prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
					prose-pre:bg-dark-900 prose-pre:text-dark-50 prose-pre:rounded-lg prose-pre:border prose-pre:border-dark-700 prose-pre:text-xs sm:prose-pre:text-sm md:prose-pre:text-sm
					prose-ul:text-dark-600 prose-ul:my-4 sm:prose-ul:my-5 md:prose-ul:my-6 prose-ul:leading-relaxed
					prose-ol:text-dark-600 prose-ol:my-4 sm:prose-ol:my-5 md:prose-ol:my-6 prose-ol:leading-relaxed
					prose-li:my-1 sm:prose-li:my-1.5 md:prose-li:my-2 prose-li:text-sm sm:prose-li:text-base md:prose-li:text-base
			prose-blockquote:border-l-4 prose-blockquote:border-azure-500 prose-blockquote:pl-4 sm:prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-dark-600 prose-blockquote:my-6 sm:prose-blockquote:my-8
			prose-hr:border-dark-200 prose-hr:my-6 sm:prose-hr:my-8
			prose-img:my-6 sm:prose-img:my-8
			project-content"
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html project.html}
			</section>
		{:else}
			<section class="text-xs sm:text-sm text-dark-600 italic">
				No additional details available for this project.
			</section>
		{/if}

		{#if project.lastModified}
			<footer class="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8">
				<p class="text-xs sm:text-sm text-dark-500 text-right">
					Last updated:{' '}
					<time datetime={new Date(project.lastModified).toISOString()}>
						{new Date(project.lastModified).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</time>
				</p>
			</footer>
		{/if}
	</article>
</main>
<Footer />
