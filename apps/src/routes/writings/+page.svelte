<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const posts = data.posts;
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
