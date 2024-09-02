<script>
	import { allUses } from 'content-collections';
	import { blur } from 'svelte/transition';
	import Footer from '$lib/components/Footer.svelte';
	import { getBreadcrumbs } from '$lib/utils/breadcrumbs.js';
	import SEO from '$lib/components/SEO/index.svelte';

	const use = allUses[0];
</script>

<SEO
	metadescription="Things I use to building something and daily life."
	title="Uses"
/>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4" in:blur={{ duration: 100 }} out:blur={{ duration: 100 }}>
	<nav class="text-gray-600 font-medium text-sm line-clamp-1 pr-4">
		<a class="hover:text-gray-500 hover:underline cursor-pointer"
			 href="/" title="home">home</a>
		<span class="mx-0.5 sm:mx-1">/</span>
		{#each getBreadcrumbs() as breadcrumb, index}
			{#if !breadcrumb.isCurrent}
				<a href={breadcrumb.url} class="hover:text-gray-500 hover:underline cursor-pointer"
					 title={breadcrumb.url}>
					{breadcrumb.name}
				</a>
			{:else}
				<span>{breadcrumb.name}</span>
			{/if}
			{#if index < getBreadcrumbs().length - 1}
				<span class="mx-1">/</span>
			{/if}
		{/each}
	</nav>
	<article class="pt-8 space-y-4 text-sm sm:text-base">
		<div
			class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pr-2 prose-p:text-gray-800 pt-4 pb-8 prose-img:drop-shadow-2xl">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html use.html}
		</div>
		{#if use.lastModified}
			<p class="text-xs sm:text-sm text-gray-600 text-right font-light">
				Last modified on {new Date(use.lastModified).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})}
			</p>
		{/if}
	</article>
</main>
<Footer />