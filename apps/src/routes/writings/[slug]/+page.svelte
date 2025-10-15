<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { Calendar, Eye } from '@lucide/svelte';

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
		<meta
			property="article:modified_time"
			content={new Date(post.lastModified).toISOString()}
		/>
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

<main class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 min-h-screen">
	<Breadcrumbs path={breadcrumbPath} />

	<article>
		<header class="mb-6 sm:mb-12">
			<h1
				class="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 sm:mb-8 tracking-tight leading-tight"
			>
				{post.title}
			</h1>

			<div
				class="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-dark-500"
			>
				<time
					datetime={post.date ? new Date(post.date).toISOString() : ''}
					class="flex items-center gap-1.5 sm:gap-2"
				>
					<Calendar class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
					<span>
						{post.date
							? new Date(post.date).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})
							: 'Date not available'}
					</span>
				</time>
				{#if post.readTime}
					<data
						value={post.readTime.replace(' ', '')}
						class="flex items-center gap-1.5 sm:gap-2"
					>
						<Eye class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						<span>{post.readTime}</span>
					</data>
				{/if}
			</div>

			{#if post.tags && post.tags.length > 0}
				<div class="flex flex-wrap gap-2 mt-4 sm:mt-6">
					{#each post.tags as tag}
						<span
							class="text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 border border-dark-300 rounded-full text-dark-600 hover:border-dark-400 transition-colors"
						>
							{tag}
						</span>
					{/each}
				</div>
			{/if}
		</header>

		<section
			class="prose prose-sm sm:prose-base md:prose-lg max-w-none
			prose-headings:text-midnight-800 prose-headings:font-semibold prose-headings:tracking-tight
			prose-h1:text-base prose-h1:sm:text-lg prose-h1:md:text-xl prose-h1:mt-8 prose-h1:sm:mt-10 prose-h1:md:mt-12 prose-h1:mb-4 prose-h1:sm:mb-5 prose-h1:md:mb-6 prose-h1:leading-tight
			prose-h2:text-base prose-h2:sm:text-lg prose-h2:md:text-xl prose-h2:mt-8 prose-h2:sm:mt-10 prose-h2:md:mt-12 prose-h2:mb-4 prose-h2:sm:mb-5 prose-h2:md:mb-6 prose-h2:leading-tight
			prose-h3:text-base prose-h3:sm:text-lg prose-h3:md:text-lg prose-h3:mt-6 prose-h3:sm:mt-8 prose-h3:md:mt-10 prose-h3:mb-3 prose-h3:sm:mb-4 prose-h3:md:mb-4
			prose-h4:text-sm prose-h4:sm:text-base prose-h4:md:text-base prose-h4:mt-6 prose-h4:sm:mt-7 prose-h4:md:mt-8 prose-h4:mb-2 prose-h4:sm:mb-3 prose-h4:md:mb-3
			prose-p:text-dark-600 prose-p:text-sm prose-p:sm:text-base prose-p:md:text-base prose-p:leading-relaxed prose-p:my-4 prose-p:sm:my-5 prose-p:md:my-6
			prose-a:text-azure-600 prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-azure-300 hover:prose-a:border-azure-600 prose-a:transition-colors
			prose-strong:text-midnight-800 prose-strong:font-semibold
			prose-code:text-azure-700 prose-code:bg-azure-50 prose-code:px-1 prose-code:sm:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:sm:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
			prose-pre:bg-dark-900 prose-pre:text-dark-50 prose-pre:rounded-lg prose-pre:border prose-pre:border-dark-700 prose-pre:text-xs prose-pre:sm:text-sm prose-pre:md:text-sm
			prose-ul:text-dark-600 prose-ul:my-4 prose-ul:sm:my-5 prose-ul:md:my-6 prose-ul:leading-relaxed
			prose-ol:text-dark-600 prose-ol:my-4 prose-ol:sm:my-5 prose-ol:md:my-6 prose-ol:leading-relaxed
			prose-li:my-1 prose-li:sm:my-1.5 prose-li:md:my-2 prose-li:text-sm prose-li:sm:text-base prose-li:md:text-base
			prose-blockquote:border-l-4 prose-blockquote:border-azure-500 prose-blockquote:pl-4 prose-blockquote:sm:pl-6 prose-blockquote:italic prose-blockquote:text-dark-600 prose-blockquote:my-6 prose-blockquote:sm:my-8
			prose-hr:border-dark-200 prose-hr:my-6 prose-hr:sm:my-8
			prose-img:my-6 prose-img:sm:my-8
			post-content"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html post.html}
		</section>

		{#if post.lastModified}
			<footer class="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8">
				<p class="text-xs sm:text-sm text-dark-500 text-right">
					Last updated:{' '}
					<time datetime={new Date(post.lastModified).toISOString()}>
						{new Date(post.lastModified).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</time>
				</p>
			</footer>
		{/if}
	</article>
</main>
<Footer />

<style lang="postcss">
	/* Table of contents styling */
	:global(.post-content ul:has(li a[href^='#'])) {
		@apply bg-azure-50 border border-azure-200 p-4 sm:p-6 rounded-lg my-6 sm:my-8;
	}

	:global(.post-content ul:has(li a[href^='#']) li) {
		@apply text-midnight-800 my-1 sm:my-1.5;
	}

	/* Anchor links */
	:global(.anchor-link) {
		@apply ml-2 text-azure-500 opacity-0 hover:opacity-100 transition-opacity;
	}

	:global(h2:hover .anchor-link),
	:global(h3:hover .anchor-link),
	:global(h4:hover .anchor-link) {
		@apply opacity-100;
	}

	/* Tables */
	:global(.post-content table) {
		@apply w-full border-collapse my-6 sm:my-8 text-xs sm:text-sm md:text-base overflow-x-auto block sm:table;
	}

	:global(.post-content thead) {
		@apply bg-dark-50;
	}

	:global(.post-content th) {
		@apply border border-dark-200 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-left font-semibold text-midnight-800;
	}

	:global(.post-content td) {
		@apply border border-dark-200 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-dark-600;
	}

	:global(.post-content tbody tr:hover) {
		@apply bg-dark-50;
	}

	/* Code blocks - syntax highlighting support */
	:global(.post-content pre) {
		@apply my-6 sm:my-8 p-4 sm:p-6 overflow-x-auto;
	}

	:global(.post-content pre code) {
		@apply bg-transparent text-inherit p-0 rounded-none text-xs sm:text-sm;
	}

	/* External link icons */
	:global(.post-content a[target='_blank']) {
		@apply inline-flex items-center gap-1;
	}

	:global(.post-content a[target='_blank'] svg) {
		@apply w-3.5 h-3.5 opacity-70;
	}

	/* Figure and figcaption */
	:global(.post-content figure) {
		@apply my-6 sm:my-8;
	}

	:global(.post-content figcaption) {
		@apply text-xs sm:text-sm text-center text-dark-500 mt-2 sm:mt-3 italic;
	}

	/* Footnotes */
	:global(.post-content .footnotes) {
		@apply mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 text-xs sm:text-sm;
	}

	:global(.post-content .footnotes ol) {
		@apply pl-4;
	}
</style>
