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

	<article class="pt-8 space-y-4 text-sm sm:text-base">
		{#each posts as post}
			<section class="text-sm sm:text-base py-4 border-b border-gray-200 dark:border-gray-700">
				<h3 class="font-medium text-gray-800 dark:text-gray-200">
					<a
						href={`/writings/${post.slug}`}
						class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ease-in-out"
					>
						{post.title}
					</a>
				</h3>
				<div class="flex items-center justify-between text-sm">
					<p class="text-gray-400 dark:text-gray-500 mt-2">{post.date}</p>
					<p class="text-gray-400 dark:text-gray-500 mt-2">{post.readTime}</p>
				</div>
			</section>
		{/each}
	</article>
</main>
<Footer />
