<script>
	import { allAbouts } from 'content-collections';
	import Footer from '$lib/components/Footer.svelte';
	import { getBreadcrumbs } from '$lib/utils/breadcrumbs';

	const abouts = allAbouts[0];
	const breadcrumbs = getBreadcrumbs('about');
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
		<div
			class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pr-2 pt-4 pb-8 prose-img:drop-shadow-2xl dark:prose-invert"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html abouts.html}
		</div>
		{#if abouts.lastModified}
			<p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-right font-light">
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
