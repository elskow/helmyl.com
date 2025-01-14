<script>
	import { allAbouts } from 'content-collections';
	import Footer from '$lib/components/Footer.svelte';
	import { getBreadcrumbs } from '$lib/utils/breadcrumbs';
	import SEO from '$lib/components/SEO/index.svelte';

	const abouts = allAbouts[0];
	const breadcrumbs = getBreadcrumbs('about');
</script>

<SEO metadescription="What I think about myself" title="Get to Know Me!" />

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4">
	<nav class="text-gray-600 font-medium text-sm line-clamp-1 pr-4">
		<a
			class="text-blue-800 hover:text-gray-800 hover:text-bold cursor-pointer transition-colors duration-200 ease-in-out"
			href="/"
			title="home">home</a
		>
		<span class="mx-0.5 sm:mx-1">/</span>
		{#each breadcrumbs as breadcrumb, index}
			{#if !breadcrumb.isCurrent}
				<a
					href={breadcrumb.url}
					class="text-blue-800 hover:text-gray-800 hover:text-bold cursor-pointer transition-colors duration-200 ease-in-out"
					title={breadcrumb.url}
				>
					{breadcrumb.name}
				</a>
			{:else}
				<span class="text-neutral-950">{breadcrumb.name}</span>
			{/if}
			{#if index < breadcrumbs.length - 1}
				<span class="mx-1">/</span>
			{/if}
		{/each}
	</nav>

	<article class="pt-8 space-y-4 text-sm sm:text-base">
		<div
			class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pr-2 prose-p:text-gray-800 pt-4 pb-8 prose-img:drop-shadow-2xl"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html abouts.html}
		</div>
		{#if abouts.lastModified}
			<p class="text-xs sm:text-sm text-gray-600 text-right font-light">
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
