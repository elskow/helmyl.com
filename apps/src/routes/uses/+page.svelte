<script>
	import { allUses } from 'content-collections';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

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

	<article class="pt-8 space-y-4 text-sm sm:text-base">
		<div
			class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pr-2 pt-4 pb-8 prose-img:drop-shadow-2xl dark:prose-invert"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html use.html}
		</div>
		{#if use.lastModified}
			<p class="text-xs sm:text-sm text-gray-600 text-right font-light">
				Last modified on {new Date(use.lastModified).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
		{/if}
	</article>
</main>
<Footer />
