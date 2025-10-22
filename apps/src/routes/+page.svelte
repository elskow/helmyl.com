<script lang="ts">
	import SelfDescription from '$lib/components/SelfDescription.svelte';
	import { technologies } from '$lib/technologies';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import { ArrowRight, Clock, Eye } from '@lucide/svelte';
	import { browser } from '$app/environment';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const posts = data.posts;
	const projects = data.projects;
	const qualities = ['secure', 'scalable', 'fast', 'reliable'];

	let mounted = $state(false);
	let isTouchDevice = $state(false);

	onMount(() => {
		mounted = true;

		// Detect if we're on a touch device
		if (browser) {
			isTouchDevice = window.matchMedia('(hover: none)').matches;
		}
	});

	const pageTitle = 'Helmy Luqmanulhakim - Software Engineer';
	const pageDescription =
		'Software engineer specializing in web development, data engineering, and building scalable solutions. Explore my projects, writings, and tech insights.';
	const pageUrl = 'https://helmyl.com/';
	const ogImage = 'https://helmyl.com/og/home.png';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta
		name="keywords"
		content="Helmy Luqmanulhakim, software engineer, web development, data engineering, programming, full stack developer, SvelteKit, TypeScript, React, Python"
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:alt" content="Helmy Luqmanulhakim - Software Engineer" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={pageUrl} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content="Helmy Luqmanulhakim - Software Engineer" />
	<meta name="twitter:site" content="@helmyl" />
	<meta name="twitter:creator" content="@helmyl" />

	<link rel="canonical" href={pageUrl} />
</svelte:head>

<main class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 min-h-screen">
	<!-- Header -->
	<header class="mb-8 sm:mb-10 md:mb-12">
		<h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
			Helmy Luqmanulhakim
		</h1>
		<p class="text-base sm:text-lg text-dark-600 mb-4 sm:mb-6">
			Software Engineer building solution that <SelfDescription attributes={qualities} />
		</p>
		<nav class="flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm">
			<a href="/about" class="text-midnight-800 hover:text-dark-600 transition-colors">
				About
			</a>
			<a href="/labs" class="text-midnight-800 hover:text-dark-600 transition-colors">
				Labs
			</a>
			<a href="/uses" class="text-midnight-800 hover:text-dark-600 transition-colors">
				Uses
			</a>
		</nav>
	</header>

	<!-- Status -->
	<section class="mb-8 sm:mb-10 md:mb-12">
		<div class="flex items-center gap-2 text-xs sm:text-sm text-dark-600 mb-6 sm:mb-8">
			<span class="relative flex h-2 w-2">
				<span
					class="animate-ping absolute inline-flex h-full w-full rounded-full bg-midnight-800 opacity-75"
				></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-midnight-800"></span>
			</span>
			<p>
				Currently at{' '}
				<a
					href="https://www.bca.co.id/id"
					target="_blank"
					rel="noopener noreferrer"
					class="text-midnight-800 underline underline-offset-4 hover:text-dark-600 transition-colors"
				>
					Bank Central Asia
				</a>
			</p>
		</div>
	</section>

	<!-- Tech Stack -->
	<section class="mb-8 sm:mb-10 md:mb-12">
		<h2 class="text-xs sm:text-sm uppercase tracking-wider text-dark-600 mb-4 sm:mb-6">
			Tech Stack
		</h2>
		<div class="flex flex-wrap gap-2 sm:gap-3">
			{#each technologies as { name, link }}
				<a
					href={link}
					target="_blank"
					rel="noopener noreferrer"
					class="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 border border-dark-200 rounded-full hover:border-midnight-800 transition-colors"
				>
					{name}
				</a>
			{/each}
		</div>
	</section>

	<!-- Projects -->
	<section class="mb-12 sm:mb-14 md:mb-16">
		<div class="flex items-center justify-between mb-4 sm:mb-6">
			<h2 class="text-xs sm:text-sm uppercase tracking-wider text-dark-600">
				Selected Projects
			</h2>
			<a
				href="/projects"
				class="text-xs sm:text-sm text-midnight-800 hover:text-dark-600 transition-colors flex items-center gap-1"
			>
				View all
				<ArrowRight class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
			</a>
		</div>

		<div class="space-y-4 sm:space-y-6">
			{#each projects as project}
				<ProjectCard {...project} />
			{/each}
		</div>
	</section>

	<!-- Writing -->
	<section class="mb-12 sm:mb-14 md:mb-16">
		<div class="flex items-center justify-between mb-4 sm:mb-6">
			<h2 class="text-xs sm:text-sm uppercase tracking-wider text-dark-600">
				Recent Writing
			</h2>
			<a
				href="/writings"
				class="text-xs sm:text-sm text-midnight-800 hover:text-dark-600 transition-colors flex items-center gap-1"
			>
				View all
				<ArrowRight class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
			</a>
		</div>

		<div class="space-y-3 sm:space-y-4">
			{#each posts as post}
				<a href={`/writings/${post.slug}`} class="block group">
					<article
						class="flex items-center justify-between py-2 sm:py-3 border-b border-dark-200 group-hover:border-midnight-800 transition-colors"
					>
						<div class="flex-1 min-w-0 pr-4">
							<h3
								class="text-sm sm:text-base font-medium group-hover:text-dark-600 transition-colors truncate"
							>
								{post.title}
							</h3>
						</div>
						<div
							class="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-dark-600 shrink-0"
						>
							<time datetime={post.date ? new Date(post.date).toISOString() : ''}>
								{post.date}
							</time>
						</div>
					</article>
				</a>
			{/each}
		</div>
	</section>
</main>
<Footer />
