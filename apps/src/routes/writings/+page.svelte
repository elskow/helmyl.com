<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const posts = data.posts;

	const pageTitle = 'Writing - Helmy Luqmanulhakim';
	const pageDescription =
		'Read my thoughts, insights, and articles on software development, data engineering, technical solutions, and industry trends.';
	const pageUrl = 'https://helmyl.com/writings';
	const ogImage = 'https://helmyl.com/og/writings-list.png';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta
		name="keywords"
		content="tech articles, software development blog, coding tutorials, programming insights, data engineering, web development, Helmy Luqmanulhakim writings"
	/>
	<meta name="author" content="Helmy Luqmanulhakim" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:alt" content="Helmy Luqmanulhakim - Writings & Articles" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={pageUrl} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription}
	/>
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content="Helmy Luqmanulhakim - Writings & Articles" />
	<meta name="twitter:site" content="@helmyl" />
	<meta name="twitter:creator" content="@helmyl" />

	<link rel="canonical" href={pageUrl} />

	<!-- Structured Data - ItemList for Blog Posts -->
	<script type="application/ld+json">
		{JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Blog',
			name: 'Helmy Luqmanulhakim - Writings',
			description: pageDescription,
			url: pageUrl,
			author: {
				'@type': 'Person',
				'@id': 'https://helmyl.com/#person',
				name: 'Helmy Luqmanulhakim',
				url: 'https://helmyl.com'
			},
			inLanguage: 'en-US',
			blogPost: posts.map((post) => ({
				'@type': 'BlogPosting',
				headline: post.title,
				url: `https://helmyl.com/writings/${post.slug}`,
				datePublished: post.date ? new Date(post.date).toISOString() : undefined
			}))
		})}
	</script>

	<!-- Structured Data - Breadcrumbs -->
	<script type="application/ld+json">
		{JSON.stringify({
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
					name: 'Writings',
					item: pageUrl
				}
			]
		})}
	</script>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 min-h-screen">
	<Breadcrumbs path="writings" />

	<h1 class="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 tracking-tight">
		Writings
	</h1>
	<p class="text-xs sm:text-sm md:text-base text-dark-600 mb-8 sm:mb-10 md:mb-12 leading-relaxed">
		Thoughts and insights on software development, technical solutions, and industry trends.
	</p>

	<div class="space-y-6 sm:space-y-8">
		{#each posts as post}
			{@const formattedDate = post.date
				? new Date(post.date).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})
				: 'Date not available'}

			<article class="pb-4 sm:pb-6 border-b border-dark-200 last:border-b-0">
				<a href="/writings/{post.slug}" class="block group">
					<h2
						class="text-base sm:text-lg font-semibold mb-2 sm:mb-3 tracking-tight group-hover:text-azure-600 transition-colors"
					>
						{post.title}
					</h2>
					<p class="text-xs sm:text-sm text-dark-500 mb-1 sm:mb-2">{formattedDate}</p>
					<p class="text-xs sm:text-sm text-dark-600 leading-relaxed">
						{post.readTime || 'Read article'}
					</p>
				</a>
			</article>
		{/each}
	</div>
</div>
<Footer />
