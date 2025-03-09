<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { getBreadcrumbs } from '$lib/utils/breadcrumbs';

	/** @type {import('./$types').PageData} */
	export let data;
	const posts = data.posts;

	const breadcrumbs = getBreadcrumbs('writings');
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
	<nav class="text-gray-600 dark:text-gray-400 font-medium text-sm line-clamp-1 pr-4">
		<a
			class="text-blue-800 dark:text-blue-400 hover:text-gray-800 dark:hover:text-gray-200 hover:text-bold cursor-pointer transition-colors duration-200 ease-in-out"
			href="/"
			title="home">home</a
		>
		<span class="mx-0.5 sm:mx-1">/</span>
		{#each breadcrumbs as breadcrumb, index}
			{#if !breadcrumb.isCurrent}
				<a
					href={breadcrumb.url}
					class="text-blue-800 dark:text-blue-400 hover:text-gray-800 dark:hover:text-gray-200 hover:text-bold cursor-pointer transition-colors duration-200 ease-in-out"
					title={breadcrumb.url}
				>
					{breadcrumb.name}
				</a>
			{:else}
				<span class="text-neutral-950 dark:text-neutral-200">{breadcrumb.name}</span>
			{/if}
			{#if index < breadcrumbs.length - 1}
				<span class="mx-1">/</span>
			{/if}
		{/each}
	</nav>

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
