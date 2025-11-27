<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import RelatedContent from '$lib/components/RelatedContent.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { calculateReadingTime, getWordCount } from '$lib/utils/seo';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();

	const post = $derived(data.post);
	const relatedArticles = $derived(data.relatedArticles || []);

	// Structured data calculations
	const readingTime = $derived(calculateReadingTime(post.html));
	const wordCount = $derived(getWordCount(post.html));

	// Reading progress
	let readingProgress = $state(0);
	function updateReadingProgress() {
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight - windowHeight;
		const scrolled = window.scrollY;
		const progress = (scrolled / documentHeight) * 100;
		readingProgress = Math.min(100, Math.max(0, progress));
	}

	// Share Logic
	let isCopied = $state(false);
	const shareUrl = $derived(`https://helmyl.com/writings/${post.slug}`);
	const shareText = $derived(encodeURIComponent(post.title));

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			isCopied = true;
			setTimeout(() => (isCopied = false), 2000);
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
	}

	onMount(() => {
		window.addEventListener('scroll', updateReadingProgress, { passive: true });
		return () => window.removeEventListener('scroll', updateReadingProgress);
	});

	// Re-execute scripts (for Twitter/widgets) when content loads
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
		if (post) executePostScripts();
	});

	// Meta details
	const articleUrl = $derived(`https://helmyl.com/writings/${post.slug}`);
	const pageTitle = $derived(`${post.title} - Helmy Luqmanulhakim`);
	const pageDescription = $derived(
		post.excerpt || post.description || `Read my thoughts on ${post.title}.`
	);
	const ogImage = $derived(post.image || `https://helmyl.com/og/writings/${post.slug}.png`);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={articleUrl} />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:alt" content={post.title} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="en_US" />
	{#if post.date}
		<meta property="article:published_time" content={new Date(post.date).toISOString()} />
	{/if}
	{#if post.lastModified}
		<meta property="article:modified_time" content={new Date(post.lastModified).toISOString()} />
	{/if}
	<meta property="article:author" content="Helmy Luqmanulhakim" />
	{#if post.tags}
		{#each post.tags as tag}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={articleUrl} />
	<meta name="twitter:site" content="@helmyl" />
	<meta name="twitter:creator" content="@helmyl" />
	<meta name="twitter:title" content={post.title} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content={post.title} />

	<link rel="canonical" href={articleUrl} />

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description: pageDescription,
		image: {
			'@type': 'ImageObject',
			url: ogImage,
			width: 1200,
			height: 630
		},
		url: articleUrl,
		datePublished: post.date ? new Date(post.date).toISOString() : undefined,
		dateModified: post.lastModified
			? new Date(post.lastModified).toISOString()
			: post.date
				? new Date(post.date).toISOString()
				: undefined,
		author: {
			'@type': 'Person',
			'@id': 'https://helmyl.com/#person',
			name: 'Helmy Luqmanulhakim',
			url: 'https://helmyl.com'
		},
		keywords: post.tags ? post.tags.join(', ') : undefined,
		wordCount: wordCount,
		timeRequired: readingTime.replace(' read', '').replace(' min', 'M'),
		inLanguage: 'en-US',
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': articleUrl
		}
	})}</script>`}
</svelte:head>

<div
	class="fixed top-0 left-0 h-0.5 bg-neutral-900 z-50 transition-all duration-150"
	style="width: {readingProgress}%"
	aria-hidden="true"
></div>

<main
	class="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 md:py-24 min-h-screen text-neutral-900 font-sans"
>
	<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-24">
		<div class="md:col-span-7 lg:col-span-8">
			<article>
				<header class="mb-12 md:mb-16">
					<a
						href="/writings"
						class="text-xs text-neutral-400 hover:text-neutral-900 mb-6 md:mb-8 inline-block transition-colors"
					>
						← Back to writings
					</a>
					<h1
						class="text-3xl sm:text-4xl font-medium tracking-tight leading-[1.15] text-neutral-950 mb-6"
					>
						{post.title}
					</h1>

					<div class="md:hidden border-t border-neutral-100 pt-6 mt-6 space-y-4">
						<div class="flex justify-between items-baseline text-sm">
							<span class="text-neutral-400 text-xs uppercase tracking-wide">Published</span>
							<span class="text-neutral-900 font-mono">
								{post.date
									? new Date(post.date).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})
									: 'N/A'}
							</span>
						</div>

						{#if post.readTime}
							<div class="flex justify-between items-baseline text-sm">
								<span class="text-neutral-400 text-xs uppercase tracking-wide">Reading Time</span>
								<span class="text-neutral-900 font-mono">{post.readTime}</span>
							</div>
						{/if}

						{#if post.tags && post.tags.length > 0}
							<div class="pt-2">
								<div class="flex flex-wrap gap-2">
									{#each post.tags as tag}
										<span
											class="text-xs border border-neutral-200 px-2 py-1 rounded-sm text-neutral-600 bg-neutral-50"
										>
											{tag}
										</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</header>

				<div class="post-content">
					{@html post.html}
				</div>
			</article>

			{#if relatedArticles.length > 0}
				<RelatedContent currentItem={post} allItems={relatedArticles} type="writings" />
			{/if}

			<nav class="mt-16 pt-8 border-t border-neutral-100">
				<h3 class="text-[10px] text-neutral-400 mb-4 uppercase tracking-widest select-none">
					Menu
				</h3>
				<div class="flex flex-wrap gap-6 text-sm">
					<a href="/" class="text-neutral-600 hover:text-black transition-colors">Home</a>
					<a href="/projects" class="text-neutral-600 hover:text-black transition-colors"
						>Projects</a
					>
					<a href="/writings" class="text-neutral-600 hover:text-black transition-colors">Writing</a
					>
					<a href="/about" class="text-neutral-600 hover:text-black transition-colors">About</a>
				</div>
			</nav>
		</div>

		<div class="md:col-span-5 lg:col-span-4 md:pl-12 lg:pl-24 space-y-12 hidden md:block">
			<div class="sticky top-24 space-y-16">
				<div>
					<h3 class="text-[10px] text-neutral-400 mb-6 uppercase tracking-widest select-none">
						About this post
					</h3>
					<dl class="space-y-6 text-sm">
						<div>
							<dt class="text-neutral-400 text-xs mb-1.5">Published</dt>
							<dd class="text-neutral-900 font-mono">
								{post.date
									? new Date(post.date).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})
									: 'N/A'}
							</dd>
						</div>

						{#if post.readTime}
							<div>
								<dt class="text-neutral-400 text-xs mb-1.5">Reading Time</dt>
								<dd class="text-neutral-900 font-mono">{post.readTime}</dd>
							</div>
						{/if}

						{#if post.tags && post.tags.length > 0}
							<div>
								<dt class="text-neutral-400 text-xs mb-2">Topics</dt>
								<dd class="flex flex-wrap gap-2">
									{#each post.tags as tag}
										<span
											class="inline-flex items-center px-2 py-1 border border-neutral-200 rounded-sm text-xs text-neutral-600 cursor-default"
										>
											{tag}
										</span>
									{/each}
								</dd>
							</div>
						{/if}
					</dl>
				</div>

				<div>
					<h3 class="text-[10px] text-neutral-400 mb-6 uppercase tracking-widest select-none">
						Share
					</h3>
					<ul class="space-y-3 text-sm">
						<li>
							<a
								href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
								target="_blank"
								rel="noopener noreferrer"
								class="flex justify-between group"
							>
								<span class="text-neutral-600 group-hover:text-black transition-colors"
									>Twitter</span
								>
								<span class="text-neutral-300 group-hover:text-black transition-colors">↗</span>
							</a>
						</li>
						<li>
							<a
								href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
								target="_blank"
								rel="noopener noreferrer"
								class="flex justify-between group"
							>
								<span class="text-neutral-600 group-hover:text-black transition-colors"
									>LinkedIn</span
								>
								<span class="text-neutral-300 group-hover:text-black transition-colors">↗</span>
							</a>
						</li>
						<li>
							<button onclick={copyLink} class="flex justify-between group w-full text-left">
								<span class="text-neutral-600 group-hover:text-black transition-colors">
									{isCopied ? 'Link Copied' : 'Copy Link'}
								</span>
								<span class="text-neutral-300 group-hover:text-black transition-colors">
									{isCopied ? '✓' : '+'}
								</span>
							</button>
						</li>
					</ul>
				</div>

				<div class="border-t border-neutral-100 pt-8">
					<h3 class="text-[10px] text-neutral-400 mb-4 uppercase tracking-widest select-none">
						Written by
					</h3>
					<div class="flex items-center gap-4">
						<div
							class="w-10 h-10 bg-neutral-100 rounded-full overflow-hidden flex-shrink-0 border border-neutral-200"
						>
							<img
								src="https://avatars.githubusercontent.com/u/103118501?v=4"
								alt="Helmy Luqmanulhakim"
								class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 ease-out"
							/>
						</div>
						<div>
							<p class="text-sm font-medium text-neutral-900">Helmy Luqmanulhakim</p>
							<a
								href="https://twitter.com/helmy_lh"
								target="_blank"
								class="text-xs text-neutral-500 hover:text-black transition-colors"
							>
								@helmy_lh
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
<Footer />

<style>
	/* Standard CSS overrides.
		Colors map to standard Tailwind Neutral values:
		950: #0a0a0a | 900: #171717 | 600: #525252 | 400: #a3a3a3 | 300: #d4d4d4 | 200: #e5e5e5 | 100: #f5f5f5
	*/

	:global(.post-content) {
		color: #525252;
	}

	/* HEADINGS */
	:global(.post-content h2) {
		color: #0a0a0a;
		margin-top: 4rem;
		margin-bottom: 1.5rem;
		font-size: 1.25rem;
		line-height: 1.375;
		font-weight: 500;
		letter-spacing: -0.025em;
	}

	@media (min-width: 640px) {
		:global(.post-content h2) {
			font-size: 1.5rem;
		}
	}

	:global(.post-content h3) {
		color: #171717;
		margin-top: 3rem;
		margin-bottom: 1rem;
		font-size: 1.125rem;
		line-height: 1.375;
		font-weight: 500;
		letter-spacing: -0.025em;
	}

	@media (min-width: 640px) {
		:global(.post-content h3) {
			font-size: 1.25rem;
		}
	}

	:global(.post-content h4) {
		color: #171717;
		margin-top: 2rem;
		margin-bottom: 0.75rem;
		font-size: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	/* TEXT & LINKS */
	:global(.post-content p) {
		margin-bottom: 1.5rem;
		line-height: 1.75;
		font-weight: 400;
	}

	@media (min-width: 640px) {
		:global(.post-content p) {
			line-height: 2;
		}
	}

	:global(.post-content a) {
		color: #171717;
		font-weight: 500;
		text-decoration: underline;
		text-decoration-color: #d4d4d4;
		text-underline-offset: 4px;
		text-decoration-thickness: 1px;
		transition: all 0.2s;
	}

	:global(.post-content a:hover) {
		text-decoration-color: #171717;
	}

	:global(.post-content strong) {
		color: #171717;
		font-weight: 600;
	}

	/* LISTS */
	:global(.post-content ul) {
		list-style-type: disc;
		list-style-position: outside;
		margin-left: 1.25rem;
		margin-bottom: 1.5rem;
		color: #525252;
	}

	:global(.post-content ol) {
		list-style-type: decimal;
		list-style-position: outside;
		margin-left: 1.25rem;
		margin-bottom: 1.5rem;
		color: #525252;
	}

	:global(.post-content li) {
		margin-bottom: 0.5rem;
		padding-left: 0.25rem;
		line-height: 1.75;
	}

	:global(.post-content li::marker) {
		color: #d4d4d4;
	}

	/* BLOCKQUOTES */
	:global(.post-content blockquote) {
		border-left: 2px solid #e5e5e5;
		padding-left: 1.5rem;
		margin-top: 2rem;
		margin-bottom: 2rem;
		font-style: italic;
		color: #404040;
		background-color: transparent;
		font-weight: 300;
	}

	/* IMAGES & CAPTIONS */
	:global(.post-content img) {
		width: 100%;
		border-radius: 0.125rem;
		margin-top: 2rem;
		margin-bottom: 2rem;
		display: block;
	}

	:global(.post-content figcaption) {
		font-size: 0.75rem;
		color: #a3a3a3;
		text-align: center;
		margin-top: 0.75rem;
		margin-bottom: 2.5rem;
		display: block;
		font-weight: 400;
	}

	/* CODE BLOCKS (Pre) */
	:global(.post-content pre) {
		background-color: #171717;
		color: #fafafa;
		padding: 1.5rem;
		border-radius: 0.125rem;
		overflow-x: auto;
		margin-top: 2rem;
		margin-bottom: 2rem;
		font-size: 0.875rem;
		line-height: 1.625;
		border: 1px solid #262626;
	}

	/* INLINE CODE */
	:global(.post-content code) {
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		font-size: 0.875rem;
		color: #262626;
		background-color: #f5f5f5;
		padding: 0.125rem 0.375rem;
		border-radius: 0.125rem;
	}

	/* Remove annoying backticks added by Tailwind typography plugin */
	:global(.post-content code::before),
	:global(.post-content code::after) {
		content: none !important;
	}

	/* Ensure code inside pre doesn't get the inline styling */
	:global(.post-content pre code) {
		background-color: transparent;
		color: inherit;
		padding: 0;
		font-size: inherit;
	}

	/* TABLES */
	:global(.post-content table) {
		width: 100%;
		border-collapse: collapse;
		margin-top: 2.5rem;
		margin-bottom: 2.5rem;
		font-size: 0.875rem;
	}

	:global(.post-content th) {
		text-align: left;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e5e5e5;
		font-weight: 500;
		color: #171717;
	}

	:global(.post-content td) {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #f5f5f5;
		color: #525252;
	}

	/* HORIZONTAL RULE */
	:global(.post-content hr) {
		border: 0;
		border-top: 1px solid #e5e5e5;
		margin-top: 3rem;
		margin-bottom: 3rem;
	}
</style>
