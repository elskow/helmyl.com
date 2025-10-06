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
	let isPageLoaded = $state(false);

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
		isPageLoaded = true;
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

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4 relative">
	<Breadcrumbs path={breadcrumbPath} />

	<!-- Decorative corner element -->
	<div
		class="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-20 dark:opacity-30 flex items-center justify-center"
	>
		<svg
			width="90"
			height="90"
			viewBox="0 0 100 100"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="transform -translate-x-1 -translate-y-1"
		>
			<path
				d="M5 5L95 5L95 95"
				stroke="currentColor"
				stroke-width="1"
				stroke-dasharray="4 4"
			/>
			<circle cx="70" cy="30" r="4" fill="currentColor" opacity="0.5" />
			<circle cx="30" cy="70" r="2" fill="currentColor" opacity="0.3" />
		</svg>
	</div>

	<article class="pt-8 space-y-4 text-sm sm:text-base {isPageLoaded ? 'animate-fade-in' : ''}">
		<header class="space-y-4 border-b border-dark-200 dark:border-midnight-700 pb-6 relative">
			<h1 class="text-2xl md:text-3xl font-semibold text-midnight-800 dark:text-dark-100">
				{post.title}
			</h1>
			<!-- Decorative accent line -->
			<div
				class="w-16 h-1 bg-gradient-to-r from-azure-500/70 dark:from-azure-400/70 to-transparent rounded-full mb-4"
			></div>
			<div class="flex items-center gap-4 justify-between">
				<time
					datetime={post.date ? new Date(post.date).toISOString() : ''}
					class="text-sm text-dark-500 dark:text-dark-400 flex items-center"
				>
					<Calendar class="w-3.5 h-3.5 mr-1.5 opacity-70" />
					{post.date
						? new Date(post.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})
						: 'Date not available'}
				</time>
				{#if post.readTime}
					<data
						value={post.readTime.replace(' ', '')}
						class="text-sm text-dark-500 dark:text-dark-400 flex items-center"
					>
						<Eye class="w-3.5 h-3.5 mr-1.5 opacity-70" />
						{post.readTime}
					</data>
				{/if}
			</div>

			{#if post.tags && post.tags.length > 0}
				<div class="flex flex-wrap gap-2 mt-2">
					{#each post.tags as tag}
						<span
							class="bg-dark-100/70 dark:bg-midnight-800/70 text-xs px-3 py-1 rounded-full font-medium text-dark-700 dark:text-dark-200"
						>
							{tag}
						</span>
					{/each}
				</div>
			{/if}
		</header>

		<section
			class="prose prose-sm sm:prose-base space-y-4 md:space-y-6 prose-headings:prose-base sm:prose-headings:prose-base min-w-full pr-2 pt-6 pb-8 post-content dark:prose-invert prose-a:text-azure-600 dark:prose-a:text-azure-400 prose-headings:group relative"
			aria-label="Article content"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html post.html}
		</section>

		{#if post.lastModified}
			<footer
				class="text-xs sm:text-sm text-dark-500 dark:text-dark-400 text-right font-light border-t border-dark-200/30 dark:border-dark-600/50 pt-4 mt-8"
			>
				<time datetime={new Date(post.lastModified).toISOString()}>
					Last modified on {new Date(post.lastModified).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</time>
			</footer>
		{/if}
	</article>
</main>
<Footer />

<style lang="postcss">
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.animate-fade-in {
		animation: fadeIn 0.8s ease-out forwards;
	}

	/* Styling for table of contents */
	:global(.post-content ul:has(li a[href^='#'])) {
		@apply bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg my-6;
	}

	:global(.anchor-link) {
		@apply ml-2 text-azure-500 dark:text-azure-400;
	}

	:global(.post-content pre) {
		@apply my-6 rounded-lg shadow-md;
	}

	:global(.post-content blockquote) {
		@apply border-l-4 border-azure-500 dark:border-azure-400 pl-4 italic;
	}

	:global(.post-content table) {
		@apply border-collapse w-full my-6;
	}

	:global(.post-content th) {
		@apply bg-gray-100 dark:bg-gray-800 p-2 text-left;
	}

	:global(.post-content td) {
		@apply border border-gray-200 dark:border-gray-700 p-2;
	}

	:global(.post-content a[target='_blank'] svg) {
		@apply inline-block ml-1 text-azure-500 dark:text-azure-400;
	}

	/* New styling for headings */
	:global(.post-content h2) {
		position: relative;
		display: inline-block;
	}

	:global(.post-content h2::after) {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		width: 40%;
		height: 2px;
		background: linear-gradient(to right, rgba(59, 130, 246, 0.5), transparent);
		border-radius: 9999px;
	}

	:global(.dark .post-content h2::after) {
		background: linear-gradient(to right, rgba(96, 165, 250, 0.5), transparent);
	}
</style>
