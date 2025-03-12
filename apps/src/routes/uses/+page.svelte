<script>
	import { allUses } from 'content-collections';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { CornerRightUp } from '@lucide/svelte';

	const use = allUses[0];
</script>

<svelte:head>
	<title>Tools & Tech I Use | Helmy Luqmanulhakim</title>
	<meta
		name="description"
		content="Discover the tools, technologies, and equipment I use for software development and in my daily workflow."
	/>
	<meta
		name="keywords"
		content="developer tools, software stack, tech setup, coding environment, Helmy Luqmanulhakim"
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://helmyl.com/uses" />
	<meta property="og:title" content="Tools & Tech I Use | Helmy Luqmanulhakim" />
	<meta
		property="og:description"
		content="Discover the tools, technologies, and equipment I use for software development and in my daily workflow."
	/>
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:url" content="https://helmyl.com/uses" />
	<meta name="twitter:title" content="Tools & Tech I Use | Helmy Luqmanulhakim" />
	<meta
		name="twitter:description"
		content="Discover the tools, technologies, and equipment I use for software development and in my daily workflow."
	/>

	<link rel="canonical" href="https://helmyl.com/uses" />
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4">
	<Breadcrumbs path="uses" />

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

	<article class="pt-8 space-y-4 text-sm sm:text-base">
		<header>
			<h1 class="sr-only">Tools & Tech I Use</h1>
		</header>

		<section
			class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pr-2 pt-4 pb-8 prose-img:drop-shadow-2xl dark:prose-invert prose-a:text-azure-600 dark:prose-a:text-azure-400"
			aria-label="Tools and technologies"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html use.html}
		</section>

		{#if use.lastModified}
			<footer class="text-xs sm:text-sm text-dark-500 dark:text-dark-400 text-right font-light">
				<time datetime={new Date(use.lastModified).toISOString()}>
					Last modified on {new Date(use.lastModified).toLocaleDateString('en-US', {
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
