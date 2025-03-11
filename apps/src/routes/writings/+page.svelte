<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { onMount } from 'svelte';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const posts = data.posts;
	let isPageLoaded = false;

	onMount(() => {
		isPageLoaded = true;
	});
</script>

<svelte:head>
	<title>Writings & Articles | Helmy Luqmanulhakim</title>
	<meta
		name="description"
		content="Read my thoughts, insights, and articles on software development, technical solutions, and industry trends."
	/>
	<meta
		name="keywords"
		content="tech articles, software development blog, coding tutorials, Helmy Luqmanulhakim writings"
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://helmyl.com/writings" />
	<meta property="og:title" content="Writings & Articles | Helmy Luqmanulhakim" />
	<meta
		property="og:description"
		content="Read my thoughts, insights, and articles on software development, technical solutions, and industry trends."
	/>
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://helmyl.com/writings" />
	<meta name="twitter:title" content="Writings & Articles | Helmy Luqmanulhakim" />
	<meta
		name="twitter:description"
		content="Read my thoughts, insights, and articles on software development, technical solutions, and industry trends."
	/>

	<link rel="canonical" href="https://helmyl.com/writings" />
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4 relative">
	<Breadcrumbs path="writings" />

	<!-- Decorative corner element -->
	<div class="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-20 dark:opacity-30">
		<svg
			width="100"
			height="100"
			viewBox="0 0 100 100"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M0 0L100 0L100 100" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" />
			<circle cx="70" cy="30" r="4" fill="currentColor" opacity="0.5" />
			<circle cx="30" cy="70" r="2" fill="currentColor" opacity="0.3" />
		</svg>
	</div>

	<header class="mb-8 md:mb-12 mt-4 md:mt-6 {isPageLoaded ? 'animate-fade-in' : ''}">
		<h1 class="text-2xl md:text-3xl font-bold relative inline-block">
			Writings & Articles
			<div
				class="absolute -bottom-1 left-0 w-1/3 h-1 bg-gradient-to-r from-azure-500/70 dark:from-azure-400/70 to-transparent rounded-full"
			></div>
		</h1>
		<p class="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mt-4">
			Thoughts, insights, and articles on software development and technical solutions.
		</p>
	</header>

	<ul class="space-y-4 text-sm sm:text-base list-none">
		{#each posts as post, i}
			<li
				class="text-sm sm:text-base py-4 border-b border-dark-200 dark:border-midnight-700 transition-all duration-300 hover:border-azure-500/30 dark:hover:border-azure-500/20 group hover:bg-dark-50/50 dark:hover:bg-midnight-800/30 rounded-md px-3 hover:shadow-sm relative {isPageLoaded
					? 'animate-slide-up'
					: ''}"
				style="animation-delay: {i * 100}ms"
			>
				<!-- Decorative dot -->
				<div
					class="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-azure-500/40 dark:bg-azure-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				></div>

				<article>
					<h2 class="font-medium text-midnight-800 dark:text-dark-100">
						<a
							href={`/writings/${post.slug}`}
							class="hover:text-azure-600 dark:hover:text-azure-400 transition-colors duration-200 ease-in-out inline-flex items-center"
						>
							<span>{post.title}</span>
							<span
								class="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-azure-500 dark:text-azure-400"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M5 12h14"></path>
									<path d="m12 5 7 7-7 7"></path>
								</svg>
							</span>
						</a>
					</h2>
					<div class="flex items-center justify-between text-sm">
						<time
							datetime={post.date ? new Date(post.date).toISOString() : ''}
							class="text-dark-400 dark:text-dark-500 mt-2 transition-colors duration-300 group-hover:text-dark-500 dark:group-hover:text-dark-400 flex items-center"
						>
							<svg
								class="w-3.5 h-3.5 mr-1.5 opacity-70"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="10"></circle>
								<polyline points="12 6 12 12 16 14"></polyline>
							</svg>
							{post.date}
						</time>
						<data
							value={post.readTime?.replace(/\s+/g, '')}
							class="text-dark-400 dark:text-dark-500 mt-2 transition-colors duration-300 group-hover:text-dark-500 dark:group-hover:text-dark-400 flex items-center"
						>
							<svg
								class="w-3.5 h-3.5 mr-1.5 opacity-70"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
								<circle cx="12" cy="12" r="3"></circle>
							</svg>
							{post.readTime}
						</data>
					</div>
				</article>
			</li>
		{/each}
	</ul>
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

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fadeIn 0.8s ease-out forwards;
	}

	.animate-slide-up {
		animation: slideUp 0.5s ease-out forwards;
	}
</style>
