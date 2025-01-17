<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { getBreadcrumbs } from '$lib/utils/breadcrumbs';
	import SEO from '$lib/components/SEO/index.svelte';
	import website from '$lib/website';
	import { afterUpdate, onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	const siteUrl = website.siteUrl;

	/** @type {import('./$types').PageData} */
	export let data;
	const post = data.post;

	const breadcrumbs = getBreadcrumbs(`writings/${post.slug}`);

	function executePostScripts() {
		const scripts = document.querySelectorAll('.post-content script');
		scripts.forEach((script) => {
			const newScript = document.createElement('script');
			newScript.textContent = script.textContent;
			script.replaceWith(newScript);
		});
	}

	onMount(() => {
		executePostScripts();
	});
	afterUpdate(() => {
		executePostScripts();
	});

	const defaultAlt = 'Default alt text';
	const defaultWidth = 672;
	const defaultHeight = 448;
	const defaultCaption = 'Default caption';

	const featuredImage =
		typeof post?.image === 'string'
			? {
					url: `${siteUrl}${post.image}`,
					alt: defaultAlt,
					width: defaultWidth,
					height: defaultHeight,
					caption: defaultCaption
				}
			: post?.image;

	const ogImage =
		typeof post?.image === 'string'
			? {
					url: `${siteUrl}${post.image}`,
					alt: defaultAlt
				}
			: post?.image;

	function initializeTwitterWidgets() {
		// Check if Twitter widgets script is already loaded
		if (window.twttr) {
			window.twttr.widgets.load();
		} else {
			// Load Twitter widgets script if not present
			const script = document.createElement('script');
			script.src = 'https://platform.twitter.com/widgets.js';
			script.async = true;
			document.head.appendChild(script);
		}
	}

	onMount(() => {
		initializeTwitterWidgets();
	});

	afterNavigate(() => {
		initializeTwitterWidgets();
	});
</script>

<svelte:head>
	<title>{post.title}</title>
</svelte:head>

<SEO
	{featuredImage}
	metadescription={post.excerpt}
	{ogImage}
	ogSquareImage={ogImage}
	title={post.title}
	twitterImage={ogImage}
/>

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
		<h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">{post.title}</h1>
		<div class="flex items-center gap-4 justify-between">
			<p class="text-sm text-gray-500 dark:text-gray-400">
				{post.date
					? new Date(post.date).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})
					: 'Date not available'}
			</p>
		</div>
		<div
			class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pr-2 pt-4 pb-8 post-content dark:prose-invert"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html post.html}
		</div>
		{#if post.lastModified}
			<p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-right font-light">
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
