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

<main class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 min-h-screen">
	<!-- Breadcrumbs -->
	<Breadcrumbs path="about" />

	<!-- Header -->
	<header class="mb-8 sm:mb-10 md:mb-12">
		<h1 class="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 tracking-tight">
			About
		</h1>
	</header>

	<!-- Content -->
	<article
		class="prose prose-sm sm:prose-base md:prose-lg max-w-none
			prose-headings:text-midnight-800 prose-headings:font-semibold prose-headings:tracking-tight
			prose-h1:text-base prose-h1:sm:text-lg prose-h1:md:text-xl prose-h1:mt-8 prose-h1:sm:mt-10 prose-h1:md:mt-12 prose-h1:mb-4 prose-h1:sm:mb-5 prose-h1:md:mb-6 prose-h1:leading-tight
			prose-h2:text-base prose-h2:sm:text-lg prose-h2:md:text-xl prose-h2:mt-8 prose-h2:sm:mt-10 prose-h2:md:mt-12 prose-h2:mb-4 prose-h2:sm:mb-5 prose-h2:md:mb-6 prose-h2:leading-tight
			prose-h3:text-base prose-h3:sm:text-lg prose-h3:md:text-lg prose-h3:mt-6 prose-h3:sm:mt-8 prose-h3:md:mt-10 prose-h3:mb-3 prose-h3:sm:mb-4 prose-h3:md:mb-4
			prose-h4:text-sm prose-h4:sm:text-base prose-h4:md:text-base prose-h4:mt-6 prose-h4:sm:mt-7 prose-h4:md:mt-8 prose-h4:mb-2 prose-h4:sm:mb-3 prose-h4:md:mb-3
			prose-p:text-dark-600 prose-p:text-sm prose-p:sm:text-base prose-p:md:text-base prose-p:leading-relaxed prose-p:my-4 prose-p:sm:my-5 prose-p:md:my-6
			prose-a:text-azure-600 prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-azure-300 hover:prose-a:border-azure-600 prose-a:transition-colors
			prose-strong:text-midnight-800 prose-strong:font-semibold
			prose-code:text-azure-700 prose-code:bg-azure-50 prose-code:px-1 prose-code:sm:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:sm:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
			prose-pre:bg-dark-900 prose-pre:text-dark-50 prose-pre:rounded-lg prose-pre:border prose-pre:border-dark-700 prose-pre:text-xs prose-pre:sm:text-sm prose-pre:md:text-sm
			prose-ul:text-dark-600 prose-ul:my-4 prose-ul:sm:my-5 prose-ul:md:my-6 prose-ul:leading-relaxed
			prose-ol:text-dark-600 prose-ol:my-4 prose-ol:sm:my-5 prose-ol:md:my-6 prose-ol:leading-relaxed
			prose-li:my-1 prose-li:sm:my-1.5 prose-li:md:my-2 prose-li:text-sm prose-li:sm:text-base prose-li:md:text-base
			prose-blockquote:border-l-4 prose-blockquote:border-azure-500 prose-blockquote:pl-4 prose-blockquote:sm:pl-6 prose-blockquote:italic prose-blockquote:text-dark-600 prose-blockquote:my-6 prose-blockquote:sm:my-8
			prose-hr:border-dark-200 prose-hr:my-6 prose-hr:sm:my-8
			prose-img:my-6 prose-img:sm:my-8
			post-content"
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html abouts.html}
	</article>

	<!-- Footer -->
	{#if abouts.lastModified}
		<footer class="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8">
			<p class="text-xs sm:text-sm text-dark-500 text-right">
				Last updated on{' '}
				<time datetime={new Date(abouts.lastModified).toISOString()}>
					{new Date(abouts.lastModified).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</time>
			</p>
		</footer>
	{/if}
</main>
<Footer />
