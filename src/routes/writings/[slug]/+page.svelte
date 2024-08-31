<script lang="ts">
	import { fly } from 'svelte/transition';
	import Footer from '$lib/components/Footer.svelte';
	import { getBreadcrumbs } from '$lib/utils/breadcrumbs';

	/** @type {import('./$types').PageData} */
	export let data;
	const post = data.post;
</script>

<svelte:head>
	<title>{post.title}</title>
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4" in:fly={{ duration: 300 }} out:fly={{ duration: 300 }}>
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
		<h1 class="text-2xl font-semibold text-gray-800">{post.title}</h1>
		<div class="flex items-center gap-4 justify-between">
			<p class="text-sm text-gray-500">
				{post.date ? new Date(post.date).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				}) : 'Date not available'}
			</p>
		</div>
		<div
			class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pr-2 prose-p:text-gray-600 pt-4 pb-8 prose-img:drop-shadow-2xl">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html post.html}
		</div>
		{#if post.lastModified}
			<p class="text-xs sm:text-sm text-gray-400 text-right font-light">
				Last modified on {new Date(post.lastModified).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})}
			</p>
		{/if}
	</article>
</main>
<Footer />