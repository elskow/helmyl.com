<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const post = data.post;
	const breadcrumbPath = `writings/${post.slug}`;

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

	$effect(() => {
		executePostScripts();
	});

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

	const articleUrl = `https://helmyl.com/writings/${post.slug}`;
</script>

<svelte:head>
	<title>{post.title} | Helmy Luqmanulhakim</title>
	<meta
		name="description"
		content={post.excerpt || `Read my thoughts on ${post.title}. ${post.description || ''}`}
	/>
	<meta
		name="keywords"
		content={post.tags
			? post.tags.join(', ') + ', Helmy Luqmanulhakim'
			: 'article, blog post, software development, Helmy Luqmanulhakim'}
	/>
	<meta name="author" content="Helmy Luqmanulhakim" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" />
	<meta property="og:url" content={articleUrl} />
	<meta property="og:title" content={post.title} />
	<meta
		property="og:description"
		content={post.excerpt || post.description || `Read my thoughts on ${post.title}.`}
	/>
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />
	{#if post.image}
		<meta property="og:image" content={post.image} />
	{/if}
	{#if post.date}
		<meta property="article:published_time" content={new Date(post.date).toISOString()} />
	{/if}
	{#if post.lastModified}
		<meta property="article:modified_time" content={new Date(post.lastModified).toISOString()} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={articleUrl} />
	<meta name="twitter:title" content={post.title} />
	<meta
		name="twitter:description"
		content={post.excerpt || post.description || `Read my thoughts on ${post.title}.`}
	/>
	{#if post.image}
		<meta name="twitter:image" content={post.image} />
	{/if}

	<link rel="canonical" href={articleUrl} />
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4">
	<Breadcrumbs path={breadcrumbPath} />

	<article class="pt-8 space-y-4 text-sm sm:text-base">
		<h1 class="text-2xl font-semibold text-midnight-800 dark:text-dark-100">{post.title}</h1>
		<div class="flex items-center gap-4 justify-between">
			<p class="text-sm text-dark-500 dark:text-dark-400">
				{post.date
					? new Date(post.date).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})
					: 'Date not available'}
			</p>
			{#if post.readTime}
				<p class="text-sm text-dark-500 dark:text-dark-400">{post.readTime}</p>
			{/if}
		</div>
		<div
			class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pr-2 pt-4 pb-8 post-content dark:prose-invert prose-a:text-azure-600 dark:prose-a:text-azure-400 prose-headings:group"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html post.html}
		</div>
		{#if post.lastModified}
			<p class="text-xs sm:text-sm text-dark-500 dark:text-dark-400 text-right font-light">
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

<style>
	/* Styling for table of contents */
	:global(.post-content ul:has(li a[href^='#'])) {
		@apply bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg my-6;
	}

	/* Styling for anchor links */
	:global(.anchor-link) {
		@apply ml-2 text-azure-500 dark:text-azure-400;
	}

	/* Styling for code blocks */
	:global(.post-content pre) {
		@apply my-6 rounded-lg shadow-md;
	}

	/* Styling for blockquotes */
	:global(.post-content blockquote) {
		@apply border-l-4 border-azure-500 dark:border-azure-400 pl-4 italic;
	}

	/* Styling for tables */
	:global(.post-content table) {
		@apply border-collapse w-full my-6;
	}

	:global(.post-content th) {
		@apply bg-gray-100 dark:bg-gray-800 p-2 text-left;
	}

	:global(.post-content td) {
		@apply border border-gray-200 dark:border-gray-700 p-2;
	}

	/* Styling for external link icons */
	:global(.post-content a[target='_blank'] svg) {
		@apply inline-block ml-1 text-azure-500 dark:text-azure-400;
	}
</style>
