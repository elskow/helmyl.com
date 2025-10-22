<script>
	import { allUses } from 'content-collections';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	const use = allUses[0];
</script>

<svelte:head>
	<title>Uses - Helmy Luqmanulhakim</title>
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
	<meta property="og:image" content="https://helmyl.com/og/uses.png" />
	<meta property="og:image:alt" content="Tools & Tech I Use" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://helmyl.com/uses" />
	<meta name="twitter:title" content="Tools & Tech I Use | Helmy Luqmanulhakim" />
	<meta
		name="twitter:description"
		content="Discover the tools, technologies, and equipment I use for software development and in my daily workflow."
	/>
	<meta name="twitter:image" content="https://helmyl.com/og/uses.png" />
	<meta name="twitter:image:alt" content="Tools & Tech I Use" />

	<link rel="canonical" href="https://helmyl.com/uses" />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 min-h-screen">
	<Breadcrumbs path="uses" />

	<h1 class="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 tracking-tight">Uses</h1>

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
			post-content"
		aria-label="Tools and technologies"
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html use.html}
	</section>

	{#if use.lastModified}
		<footer class="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8">
			<p class="text-xs sm:text-sm text-dark-500 text-right">
				Last updated:{' '}
				<time datetime={new Date(use.lastModified).toISOString()}>
					{new Date(use.lastModified).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</time>
			</p>
		</footer>
	{/if}
</div>
<Footer />
