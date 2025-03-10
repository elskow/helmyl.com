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

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4">
	<Breadcrumbs path="writings" />

	<h1 class="sr-only">Writings & Articles</h1>

	<ul class="pt-8 space-y-4 text-sm sm:text-base list-none">
		{#each posts as post}
			<li
				class="text-sm sm:text-base py-4 border-b border-dark-200 dark:border-midnight-700 transition-all duration-300 hover:border-azure-500/30 dark:hover:border-azure-500/20 group hover:bg-dark-50/50 dark:hover:bg-midnight-800/30 rounded-md px-3 hover:shadow-sm"
			>
				<article>
					<h2 class="font-medium text-midnight-800 dark:text-dark-100">
						<a
							href={`/writings/${post.slug}`}
							class="hover:text-azure-600 dark:hover:text-azure-400 transition-colors duration-200 ease-in-out inline-flex items-center"
						>
							<span>{post.title}</span>
						</a>
					</h2>
					<div class="flex items-center justify-between text-sm">
						<time
							datetime={post.date ? new Date(post.date).toISOString() : ''}
							class="text-dark-400 dark:text-dark-500 mt-2 transition-colors duration-300 group-hover:text-dark-500 dark:group-hover:text-dark-400"
						>
							{post.date}
						</time>
						<data
							value={post.readTime?.replace(/\s+/g, '')}
							class="text-dark-400 dark:text-dark-500 mt-2 transition-colors duration-300 group-hover:text-dark-500 dark:group-hover:text-dark-400"
						>
							{post.readTime}
						</data>
					</div>
				</article>
			</li>
		{/each}
	</ul>
</main>
<Footer />
