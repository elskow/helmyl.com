<script>
	import { allAbouts } from 'content-collections';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	const abouts = allAbouts[0];

	const pageTitle = 'Helmy Luqmanulhakim — Software Engineer focused on Web and Data Systems';
	const pageDescription =
		'Software engineer focused on reliable web and data systems. I work with Go, Python, and TypeScript, and care about cloud-native design, performance, and clear architecture. At BCA; Bangkit ML alum.';
	const pageUrl = 'https://helmyl.com/about';
	const ogImage = 'https://helmyl.com/og/about.png';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta
		name="keywords"
		content="Helmy Luqmanulhakim, software engineer, web development, data engineering, Go, Python, TypeScript, cloud-native, system design, Indonesia"
	/>
	<meta name="author" content="Helmy Luqmanulhakim" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="profile" />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:alt" content="Helmy Luqmanulhakim — Profile" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="en_US" />
	<meta property="profile:first_name" content="Helmy" />
	<meta property="profile:last_name" content="Luqmanulhakim" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={pageUrl} />
	<meta name="twitter:title" content={pageTitle} />
	<meta
		name="twitter:description"
		content="Building web and data systems with Go, Python, and TypeScript. Cloud-native mindset. At BCA; Bangkit ML alum."
	/>

	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content="Helmy Luqmanulhakim — Profile" />
	<meta name="twitter:site" content="@helmy_lh" />
	<meta name="twitter:creator" content="@helmy_lh" />

	<link rel="canonical" href={pageUrl} />

	<!-- Structured Data - Person Profile -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		mainEntity: {
			'@type': 'Person',
			'@id': 'https://helmyl.com/#person',
			name: 'Helmy Luqmanulhakim',
			alternateName: 'Helmy L',
			url: 'https://helmyl.com',
			image: ogImage,
			sameAs: [
				'https://github.com/helmyl',
				'https://linkedin.com/in/helmyl',
				'https://twitter.com/helmy_lh',
				'https://www.credly.com/users/helmy-luqmanulhakim'
			],
			jobTitle: 'Application Developer',
			worksFor: {
				'@type': 'Organization',
				name: 'Bank Central Asia',
				url: 'https://www.bca.co.id/'
			},
			knowsAbout: [
				'Software Engineering',
				'Web Development',
				'Data Engineering',
				'System Architecture',
				'Cloud Computing',
				'Go Programming',
				'Python',
				'TypeScript',
				'Machine Learning',
				'Performance Optimization'
			],
			alumniOf: {
				'@type': 'EducationalOrganization',
				name: 'Bangkit Academy - Machine Learning Path'
			},
			description: pageDescription
		}
	})}</script>`}

	<!-- Structured Data - Breadcrumbs -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: 'https://helmyl.com'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Profile',
				item: pageUrl
			}
		]
	})}</script>`}
</svelte:head>

<main class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 min-h-screen">
	<!-- Breadcrumbs -->
	<Breadcrumbs path="about" />

	<!-- Header -->
	<header class="mb-8 sm:mb-10 md:mb-12">
		<h1 class="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 tracking-tight">
			Helmy Luqmanulhakim
		</h1>
	</header>

	<!-- Content -->
	<article
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
