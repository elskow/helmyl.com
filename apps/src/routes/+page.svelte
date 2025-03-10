<script lang="ts">
	import SelfDescription from '$lib/components/SelfDescription.svelte';
	import { technologies } from '$lib/technologies';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Footer from '$lib/components/Footer.svelte';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const posts = data.posts;
	const projects = data.projects;
	const qualities = ['secure', 'scalable', 'fast', 'reliable'];
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
		class="pt-10 text-sm sm:text-base text-dark-600 dark:text-dark-300 space-y-4"
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

	<section class="pt-10 relative" aria-labelledby="technologies-heading">
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
						class="flex items-center space-x-2 group transition-all duration-300 ease-in-out cursor-alias sm:py-4"
						aria-label={name}
						rel="noopener noreferrer"
						title={name}
						draggable="false"
						style="--tech-color: {accentColor}"
					>
						<div
							class="flex items-center justify-center sm:bg-dark-100/80 sm:dark:bg-midnight-700/50 rounded-lg sm:p-2 backdrop-blur-sm transition-all duration-300 sm:group-hover:bg-dark-100 sm:dark:group-hover:bg-midnight-600/80 bg-none p-0"
						>
							<Icon
								class="w-5 h-5 grayscale filter group-hover:grayscale-0 transition-all duration-300"
							/>
						</div>
						<span
							class="block text-xs sm:text-sm text-dark-600 dark:text-dark-300 transition-colors duration-300 group-hover:text-[var(--tech-color)]"
						>
							{name}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="projects-heading">
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

	<section aria-labelledby="writings-heading">
		<h2
			id="writings-heading"
			class="text-base sm:text-lg font-medium text-midnight-800 dark:text-dark-100 pt-10 no-gradient"
		>
			Recent Writings
		</h2>
		<ul class="mt-4">
			{#each posts as post}
				<li
					class="text-sm sm:text-base py-4 border-b border-dark-200 dark:border-midnight-700 transition-all duration-300 hover:border-azure-500/30 dark:hover:border-azure-500/20 group"
				>
					<article>
						<h3 class="font-medium text-midnight-800 dark:text-dark-100">
							<a
								href={`/writings/${post.slug}`}
								class="hover:text-azure-600 dark:hover:text-azure-400 transition-colors duration-200 ease-in-out inline-flex items-center"
							>
								<span>{post.title}</span>
							</a>
						</h3>
						<div class="flex items-center justify-between text-xs sm:text-sm">
							<time
								datetime={post.date ? new Date(post.date).toISOString() : ''}
								class="text-dark-400 dark:text-dark-500 mt-2 transition-colors duration-300 group-hover:text-dark-500 dark:group-hover:text-dark-400"
							>
								{post.date}
							</time>
							<data
								value={post.readTime?.replace(/\s+/g, '')}
								class="text-dark-400 dark:text-dark-500 mt-2 transition-colors duration-300 group-hover:text-dark-500 dark:group-hover:text-dark-400"
							>
								{post.readTime}
							</data>
						</div>
					</article>
				</li>
			{/each}
		</ul>
	</section>
</main>
<Footer />

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.no-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

	.gradient-overlay-left,
	.gradient-overlay-right {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 80px;
		pointer-events: none;
	}

	.gradient-overlay-left {
		left: 0;
		background: linear-gradient(to right, var(--gradient-from), var(--gradient-to));
	}

	.gradient-overlay-right {
		right: 0;
		background: linear-gradient(to left, var(--gradient-from), var(--gradient-to));
	}

	:global(.dark) {
		--gradient-from: rgba(15, 23, 42, 1); /* midnight-800 */
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
</style>
