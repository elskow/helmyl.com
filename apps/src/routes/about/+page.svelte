<script>
	import { allAbouts } from 'content-collections';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	const abouts = allAbouts[0];
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

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4">
	<Breadcrumbs path="about" />

	<article class="pt-8 space-y-4 text-sm sm:text-base">
		<div
			class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pr-2 pt-4 pb-8 prose-img:drop-shadow-2xl dark:prose-invert prose-a:text-azure-600 dark:prose-a:text-azure-400"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html abouts.html}
		</div>
		{#if abouts.lastModified}
			<p class="text-xs sm:text-sm text-dark-500 dark:text-dark-300 text-right font-light">
				Last modified on {new Date(abouts.lastModified).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
		{/if}
	</article>
</main>
<Footer />
