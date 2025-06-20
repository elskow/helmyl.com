<script lang="ts">
	import SelfDescription from '$lib/components/SelfDescription.svelte';
	import { technologies } from '$lib/technologies';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount, tick } from 'svelte';
	import { ArrowRight, Clock, Eye, Briefcase } from '@lucide/svelte';
	import { browser } from '$app/environment';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const posts = data.posts;
	const projects = data.projects;
	const qualities = ['secure', 'scalable', 'fast', 'reliable'];

	// Define a type for the section keys to ensure type safety
	type SectionKey = 'intro' | 'status' | 'technologies' | 'projects' | 'writings';

	// Use a more efficient approach with content visibility
	let mounted = $state(false);

	// Track which sections are in viewport for content-visibility optimization
	let sectionsInView = {
		intro: true,
		status: false,
		technologies: false,
		projects: false,
		writings: false
	};

	let isTouchDevice = $state(false);

	// Optimize initial render by deferring non-critical operations
	onMount(async () => {
		mounted = true;

		// Detect if we're on a touch device
		if (browser) {
			isTouchDevice = window.matchMedia('(hover: none)').matches;
		}

		// Wait for first paint to complete
		await tick();

		// Set up lightweight scroll tracking for content-visibility
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const id = entry.target.id || entry.target.getAttribute('data-section');
					// Type guard to ensure id is a valid key of sectionsInView
					if (id && isSectionKey(id) && sectionsInView.hasOwnProperty(id)) {
						sectionsInView[id] = entry.isIntersecting;
					}
				});
			},
			{ rootMargin: '200px' }
		);

		// Type guard function to check if a string is a valid section key
		function isSectionKey(key: string): key is SectionKey {
			return (
				key === 'intro' ||
				key === 'status' ||
				key === 'technologies' ||
				key === 'projects' ||
				key === 'writings'
			);
		}

		// Observe all main sections
		document.querySelectorAll('[data-section]').forEach((section) => {
			observer.observe(section);
		});

		// Pre-connect to external domains for technology links
		technologies.forEach((tech) => {
			const link = document.createElement('link');
			link.rel = 'preconnect';
			link.href = new URL(tech.link).origin;
			document.head.appendChild(link);
		});
	});
</script>

<svelte:head>
	<title>Helmy Luqmanulhakim | Software Engineer</title>
	<meta
		name="description"
		content="Software engineer exploring and sharing insights on development, data engineering, and tech solutions."
	/>
	<meta
		name="keywords"
		content="Helmy Luqmanulhakim, software engineer, web development, data engineering, programming"
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://helmyl.com/" />
	<meta property="og:title" content="Helmy Luqmanulhakim | Software Engineer" />
	<meta
		property="og:description"
		content="Software engineer exploring and sharing insights on development, data engineering, and tech solutions."
	/>
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://helmyl.com/" />
	<meta name="twitter:title" content="Helmy Luqmanulhakim | Software Engineer" />
	<meta
		name="twitter:description"
		content="Software engineer exploring and sharing insights on development, data engineering, and tech solutions."
	/>

	<link rel="canonical" href="https://helmyl.com/" />
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4">
	<div class="sm:flex sm:justify-between items-center pt-8">
		<h1 class="text-lg sm:text-2xl font-semibold text-midnight-800 dark:text-dark-100">
			Helmy Luqmanulhakim
		</h1>
		<nav class="space-x-4 pt-8 sm:pt-0" aria-label="Main navigation">
			<a
				class="text-azure-600 dark:text-azure-400 font-medium hover:underline text-sm sm:text-base"
				href="/writings">Writings</a
			>
			<a
				class="text-azure-600 dark:text-azure-400 font-medium hover:underline text-sm sm:text-base"
				href="/labs">Labs</a
			>
		</nav>
	</div>

	<section
		data-section="status"
		class="pt-6 content-visibility-section"
		aria-labelledby="status-heading"
		class:cv-auto={!sectionsInView.status && mounted}
	>
		<div class="flex items-start space-x-2 text-sm sm:text-base">
			<p class="text-dark-600 dark:text-dark-300">
				Currently working as <span class="font-medium text-midnight-800 dark:text-dark-100"
					>Application Developer</span
				>
				at
				<a
					class="text-azure-600 dark:text-azure-400 font-medium"
					href="https://www.bca.co.id/id"
				>
					Bank Central Asia
				</a>
			</p>
			<div
				class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mt-1 sm:block hidden"
			></div>
		</div>
	</section>

	<section
		data-section="intro"
		class="pt-6 text-sm sm:text-base text-dark-600 dark:text-dark-300 space-y-4"
		aria-label="Introduction"
	>
		<p>
			This is my personal corner of the web where I share my journey and insights from my
			experiences in software development and data development.
		</p>
		<p>
			My focus is on crafting solutions that are not only functional but also
			<SelfDescription attributes={qualities} />
		</p>
		<p>
			<a class="text-azure-600 dark:text-azure-400 font-medium hover:underline" href="/about"
				>Get to know me</a
			>
		</p>
	</section>

	<section
		data-section="technologies"
		class="pt-10 relative content-visibility-section"
		aria-labelledby="technologies-heading"
		class:cv-auto={!sectionsInView.technologies && mounted}
	>
		<h2
			id="technologies-heading"
			class="text-base sm:text-lg font-medium text-midnight-800 dark:text-dark-100 no-gradient"
		>
			Technologies that I use :
		</h2>
		<div class="gradient-overlay-left sm:hidden dark:hidden"></div>
		<div class="gradient-overlay-right sm:hidden dark:hidden"></div>
		<ul
			class="sm:grid sm:grid-cols-4 gap-7 sm:gap-4 mt-4 text-dark-600 dark:text-dark-300 overflow-x-auto flex sm:flex-none no-scrollbar py-4 sm:pl-3 px-3 pr-8 sm:pr-3"
		>
			{#each technologies as { name, icons: Icon, link, accentColor }}
				<li>
					<a
						href={link}
						target="_blank"
						class="tech-item flex items-center space-x-2 group sm:py-4"
						aria-label={name}
						rel="noopener noreferrer"
						title={name}
						style="--tech-color: {accentColor}"
					>
						<div
							class="flex items-center justify-center sm:bg-dark-100/80 sm:dark:bg-midnight-700/50 rounded-lg sm:p-2 sm:group-hover:bg-dark-100 sm:dark:group-hover:bg-midnight-600/80 bg-none p-0"
						>
							<Icon class="w-5 h-5 grayscale group-hover:grayscale-0" />
						</div>
						<span
							class="block text-xs sm:text-sm text-dark-600 dark:text-dark-300 group-hover:text-[var(--tech-color)]"
						>
							{name}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>

	<section
		data-section="projects"
		class="content-visibility-section"
		aria-labelledby="projects-heading"
		class:cv-auto={!sectionsInView.projects && mounted}
	>
		<h2
			id="projects-heading"
			class="text-base sm:text-lg font-medium text-midnight-800 dark:text-dark-100 pt-10 no-gradient"
		>
			Some Stuff That I've Built
		</h2>
		<ul class="mt-4 sm:grid-cols-3 grid gap-2 grid-cols-2">
			{#each projects as project}
				<ProjectCard {...project} />
			{/each}
		</ul>
		<a
			class="text-azure-600 dark:text-azure-400 font-medium hover:underline text-sm mt-4 block text-right pr-2"
			href="/projects"
		>
			View more projects
		</a>
	</section>

	<section
		data-section="writings"
		class="relative content-visibility-section"
		aria-labelledby="writings-heading"
		class:cv-auto={!sectionsInView.writings && mounted}
	>
		<h2
			id="writings-heading"
			class="text-base sm:text-lg font-medium text-midnight-800 dark:text-dark-100 pt-10 no-gradient relative inline-block"
		>
			Recent Writings
			<div
				class="absolute -bottom-1 left-0 w-1/3 h-0.5 bg-gradient-to-r from-azure-500/70 dark:from-azure-400/70 to-transparent rounded-full"
			></div>
		</h2>
		<ul class="mt-4 space-y-3">
			{#each posts as post, i}
				<li
					class="writing-item text-sm sm:text-base py-3 border-b border-dark-200 dark:border-midnight-700 hover:border-azure-500/30 dark:hover:border-azure-500/20 group hover:bg-dark-50/50 dark:hover:bg-midnight-800/30 rounded-md px-3 hover:shadow-sm relative {isTouchDevice
						? 'touch-item'
						: ''}"
				>
					<!-- Decorative dot -->
					<div
						class="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-azure-500/40 dark:bg-azure-400/40 {isTouchDevice
							? 'opacity-30'
							: 'opacity-0 group-hover:opacity-100'}"
					></div>

					<article>
						<h3 class="font-medium text-midnight-800 dark:text-dark-100">
							<a
								href={`/writings/${post.slug}`}
								class="hover:text-azure-600 dark:hover:text-azure-400 inline-flex items-center"
							>
								<span>{post.title}</span>
								<span
									class="ml-1.5 {isTouchDevice
										? 'opacity-50'
										: 'opacity-0 group-hover:opacity-100'} text-azure-500 dark:text-azure-400"
								>
									<ArrowRight size="14" />
								</span>
							</a>
						</h3>
						<div class="flex items-center justify-between text-xs sm:text-sm">
							<time
								datetime={post.date ? new Date(post.date).toISOString() : ''}
								class="text-dark-400 dark:text-dark-500 mt-2 group-hover:text-dark-500 dark:group-hover:text-dark-400 flex items-center"
							>
								<Clock class="w-3.5 h-3.5 mr-1.5 opacity-70" />
								{post.date}
							</time>
							<data
								value={post.readTime?.replace(/\s+/g, '')}
								class="text-dark-400 dark:text-dark-500 mt-2 group-hover:text-dark-500 dark:group-hover:text-dark-400 flex items-center"
							>
								<Eye class="w-3.5 h-3.5 mr-1.5 opacity-70" />
								{post.readTime}
							</data>
						</div>
					</article>
				</li>
			{/each}
		</ul>
		<a
			class="text-azure-600 dark:text-azure-400 font-medium hover:underline text-sm mt-4 text-right pr-2 flex items-center justify-end"
			href="/writings"
		>
			View all writings
			<ArrowRight class="w-3.5 h-3.5 ml-1" />
		</a>
	</section>
</main>
<Footer />

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	:global(.dark) {
		--gradient-from: rgba(15, 23, 42, 1);
		--gradient-to: rgba(15, 23, 42, 0);
	}

	:root {
		--gradient-from: rgba(255, 255, 255, 1);
		--gradient-to: rgba(255, 255, 255, 0);
	}

	.no-gradient {
		position: relative;
		z-index: 1;
	}

	.content-visibility-section {
		contain: content;
		contain-intrinsic-size: 0 500px;
	}

	.cv-auto {
		content-visibility: auto;
	}

	.tech-item {
		transition-property: color, transform;
		transition-duration: 300ms;
		transition-timing-function: ease;
		cursor: alias;
	}

	.tech-item span {
		transition: color 300ms ease;
	}

	.touch-item {
		position: relative;
	}

	.touch-item:active {
		background-color: rgba(59, 130, 246, 0.05);
		border-color: rgba(59, 130, 246, 0.3);
	}

	.touch-item a {
		display: block;
		padding: 2px 0;
	}

	.touch-item * {
		transition-duration: 0.15s;
	}

	.touch-item:active .absolute {
		opacity: 1;
	}

	.touch-item:active a span:last-child {
		opacity: 1;
	}

	.writing-item {
		transition-property: background-color, border-color, box-shadow;
		transition-duration: 300ms;
		transition-timing-function: ease;
		contain: content;
	}

	.writing-item div[class*='absolute'] {
		transition: opacity 300ms ease;
	}
</style>
