<script>
	import { allAbouts } from 'content-collections';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { onMount } from 'svelte';

	const abouts = allAbouts[0];
	let isPageLoaded = $state(false);

	onMount(() => {
		isPageLoaded = true;
	});
</script>

<svelte:head>
	<title>About Me | Helmy Luqmanulhakim</title>
	<meta
		name="description"
		content="Learn more about Helmy Luqmanulhakim, my background, skills, and professional journey in software engineering."
	/>
	<meta
		name="keywords"
		content="about Helmy Luqmanulhakim, software engineer bio, developer profile"
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://helmyl.com/about" />
	<meta property="og:title" content="About Me | Helmy Luqmanulhakim" />
	<meta
		property="og:description"
		content="Learn more about Helmy Luqmanulhakim, my background, skills, and professional journey in software engineering."
	/>
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:url" content="https://helmyl.com/about" />
	<meta name="twitter:title" content="About Me | Helmy Luqmanulhakim" />
	<meta
		name="twitter:description"
		content="Learn more about Helmy Luqmanulhakim, my background, skills, and professional journey in software engineering."
	/>

	<link rel="canonical" href="https://helmyl.com/about" />
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4 relative">
	<Breadcrumbs path="about" />

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

	<article
		class="pt-8 space-y-4 text-sm sm:text-base relative {isPageLoaded ? 'animate-fade-in' : ''}"
	>
		<header>
			<h1 class="text-2xl font-semibold text-midnight-800 dark:text-dark-100">Hola World</h1>
			<div
				class="w-16 h-1 bg-gradient-to-r from-azure-500 to-transparent dark:from-azure-400 rounded-full mb-6"
			></div>
		</header>

		<section
			class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pt-4 pb-8 prose-img:drop-shadow-2xl dark:prose-invert prose-a:text-azure-600 dark:prose-a:text-azure-400 relative"
			aria-label="Biography and background"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html abouts.html}
		</section>

		{#if abouts.lastModified}
			<footer
				class="text-xs sm:text-sm text-dark-500 dark:text-dark-300 text-right font-light border-t border-dark-200/30 dark:border-dark-600/50 pt-4 mt-8"
			>
				<time datetime={new Date(abouts.lastModified).toISOString()}>
					Last modified on {new Date(abouts.lastModified).toLocaleDateString('en-US', {
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

	:global(.prose h2) {
		position: relative;
		display: inline-block;
	}

	:global(.prose h2::after) {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		width: 40%;
		height: 2px;
		background: linear-gradient(to right, rgba(59, 130, 246, 0.5), transparent);
		border-radius: 9999px;
	}

	:global(.prose p) {
		position: relative;
		z-index: 10;
	}

	:global(.prose a) {
		text-decoration: none;
		position: relative;
	}

	:global(.prose a::after) {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		width: 100%;
		height: 1px;
		background-color: currentColor;
		opacity: 0.5;
		transition: opacity 0.2s ease;
	}

	:global(.prose a:hover::after) {
		opacity: 0.8;
	}

	:global(.dark .prose h2::after) {
		background: linear-gradient(to right, rgba(96, 165, 250, 0.5), transparent);
	}
</style>
