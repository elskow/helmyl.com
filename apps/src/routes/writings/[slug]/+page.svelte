<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import RelatedContent from '$lib/components/RelatedContent.svelte';
	import { onMount } from 'svelte';
	import { calculateReadingTime, getWordCount } from '$lib/utils/seo';
	import { ArrowLeft, ArrowUp, Check, CornerDownRight, PenLine } from '@lucide/svelte';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();

	const post = $derived(data.post);
	const relatedArticles = $derived(data.relatedArticles || []);

	type TocItem = {
		id: string;
		text: string;
		level: 1 | 2 | 3;
	};

	let tableOfContents = $state<TocItem[]>([]);
	let activeHeadingId = $state('');
	let showBackToTop = $state(false);

	function collectTableOfContents() {
		tableOfContents = Array.from(
			document.querySelectorAll<HTMLHeadingElement>(
				'.post-content h1[id], .post-content h2[id], .post-content h3[id]'
			)
		)
			.map((heading) => ({
				level: Number(heading.tagName.slice(1)) as 1 | 2 | 3,
				id: heading.id,
				text:
					heading.querySelector('.heading-text')?.textContent?.trim() ||
					heading.textContent?.trim() ||
					''
			}))
			.filter((item) => item.text.length > 0);
	}

	function setupHeadingAnchors() {
		const headings = document.querySelectorAll<HTMLHeadingElement>(
			'.post-content h1[id], .post-content h2[id], .post-content h3[id]'
		);
		headings.forEach((heading) => {
			if (!heading.querySelector('.heading-text')) {
				const textWrapper = document.createElement('span');
				textWrapper.className = 'heading-text';
				while (heading.firstChild) {
					const child = heading.firstChild;
					if (
						child instanceof HTMLAnchorElement &&
						child.classList.contains('heading-anchor')
					) {
						while (child.firstChild) {
							textWrapper.appendChild(child.firstChild);
						}
						child.remove();
						continue;
					}
					textWrapper.appendChild(child);
				}
				heading.appendChild(textWrapper);
			}

			if (heading.querySelector(':scope > .heading-anchor')) return;
			const anchor = document.createElement('a');
			anchor.className = 'heading-anchor';
			anchor.href = `#${heading.id}`;
			anchor.textContent = '#';
			anchor.setAttribute(
				'aria-label',
				`Copy link to ${heading.querySelector('.heading-text')?.textContent?.trim() || 'section'}`
			);
			heading.appendChild(anchor);
		});
	}

	function setupScrollSpy() {
		const headings = document.querySelectorAll<HTMLHeadingElement>(
			'.post-content h1[id], .post-content h2[id], .post-content h3[id]'
		);
		if (headings.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeHeadingId = entry.target.id;
					}
				}
			},
			{ rootMargin: '-80px 0px -80% 0px', threshold: 0 }
		);
		headings.forEach((h) => observer.observe(h));
		return () => observer.disconnect();
	}

	const readingTime = $derived(calculateReadingTime(post.html));
	const wordCount = $derived(getWordCount(post.html));

	let readingProgress = $state(0);
	function updateReadingProgress() {
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight - windowHeight;
		const scrolled = window.scrollY;
		const progress = (scrolled / documentHeight) * 100;
		readingProgress = Math.min(100, Math.max(0, progress));
		showBackToTop = scrolled > 600;
	}

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

	function executePostScripts() {
		const scripts = document.querySelectorAll('.post-content script');
		scripts.forEach((script) => {
			const newScript = document.createElement('script');
			newScript.textContent = script.textContent;
			script.replaceWith(newScript);
		});
	}

	let cleanupScrollSpy: (() => void) | undefined;

	onMount(() => {
		executePostScripts();
		collectTableOfContents();
		setupHeadingAnchors();
		cleanupScrollSpy = setupScrollSpy();
		return () => cleanupScrollSpy?.();
	});

	$effect(() => {
		if (post) {
			executePostScripts();
			requestAnimationFrame(() => {
				collectTableOfContents();
				setupHeadingAnchors();
				cleanupScrollSpy?.();
				cleanupScrollSpy = setupScrollSpy();
			});
		}
	});

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
		<meta
			property="article:modified_time"
			content={new Date(post.lastModified).toISOString()}
		/>
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
	class="fixed top-0 left-0 h-0.5 bg-neutral-900 z-50 transition-all duration-300"
	style="width: {readingProgress}%"
	aria-hidden="true"
></div>

{#if showBackToTop}
	<button
		onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
		class="fixed bottom-10 right-10 z-40 w-9 h-9 bg-neutral-900/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-neutral-900 transition-all duration-200 cursor-pointer"
		aria-label="Back to top"
	>
		<ArrowUp class="w-4 h-4" />
	</button>
{/if}

<main
	class="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 md:py-24 min-h-screen text-neutral-900 font-sans"
>
	<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-24">
		<div class="md:col-span-8 lg:col-span-8 min-w-0">
			<article>
				<header class="mb-8 md:mb-10 max-w-3xl">
					<a
						href="/writings"
						class="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 mb-6 transition-colors"
					>
						<ArrowLeft class="w-3 h-3" /> Back to writings
					</a>

					<h1
						class="text-2xl sm:text-3xl md:text-4xl font-medium text-neutral-950 max-w-4xl"
					>
						{post.title}
					</h1>

					<div
						class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-6 text-xs text-neutral-500 font-mono"
					>
						{#if post.date}
							<time>
								{new Date(post.date).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'short',
									day: 'numeric'
								})}
							</time>
						{/if}
						<span class="text-neutral-200">&middot;</span>
						<span>{post.readTime || readingTime}</span>
						{#if post.tags && post.tags.length > 0}
							<span class="text-neutral-200">&middot;</span>
							<span class="text-neutral-400">{post.tags.join(', ')}</span>
						{/if}
					</div>

					<hr class="mt-6 border-neutral-200" />
				</header>

				<div class="post-content">
					{@html post.html}
				</div>
			</article>

			{#if relatedArticles.length > 0}
				<RelatedContent currentItem={post} allItems={relatedArticles} type="writings" />
			{/if}
		</div>

		<aside
			class="md:col-span-5 lg:col-span-4 md:pl-6 lg:pl-12 xl:pl-24 space-y-8 md:space-y-12 pt-8 md:pt-0 border-t border-neutral-100 md:border-t-0 mt-12 md:mt-0 min-w-0"
		>
			<div class="md:sticky md:top-24 space-y-8 md:space-y-12">
				<div class="hidden md:block text-neutral-300">
					<PenLine class="w-6 h-6" strokeWidth={1.5} />
				</div>

				{#if tableOfContents.length > 0}
					<nav class="toc-card hidden md:block">
						<h3
							class="text-xs text-neutral-400 mb-4 uppercase tracking-wide select-none"
						>
							Contents
						</h3>
						<ol class="space-y-2 list-none p-0 m-0">
							{#each tableOfContents as item}
								<li
									class={item.level === 3
										? 'pl-4'
										: item.level === 2
											? 'pl-2'
											: ''}
								>
									<a
										href={`#${item.id}`}
										class="toc-link block text-sm no-underline leading-snug transition-colors {activeHeadingId ===
										item.id
											? 'text-neutral-900 font-medium'
											: 'text-neutral-400 hover:text-neutral-700'}"
										aria-current={activeHeadingId === item.id
											? 'true'
											: undefined}
									>
										{item.text}
									</a>
								</li>
							{/each}
						</ol>
					</nav>
				{/if}

				<nav class="space-y-8 text-sm">
					<div>
						<h3
							class="text-xs text-neutral-400 mb-4 uppercase tracking-wide select-none"
						>
							Share
						</h3>
						<div class="flex items-center gap-4">
							<a
								href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
								target="_blank"
								rel="noopener noreferrer"
								class="text-neutral-400 hover:text-neutral-900 transition-colors"
								aria-label="Share on Twitter"
							>
								<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"
									><path
										d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
									/></svg
								>
							</a>
							<a
								href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
								target="_blank"
								rel="noopener noreferrer"
								class="text-neutral-400 hover:text-neutral-900 transition-colors"
								aria-label="Share on LinkedIn"
							>
								<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"
									><path
										d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
									/></svg
								>
							</a>
							<button
								onclick={copyLink}
								class="text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1.5 text-xs"
								aria-label="Copy link"
							>
								{#if isCopied}
									<Check class="w-3.5 h-3.5" />
								{:else}
									<svg
										class="w-4 h-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><rect x="9" y="9" width="13" height="13" rx="2" ry="2"
										></rect><path
											d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
										></path></svg
									>
								{/if}
							</button>
						</div>
					</div>

					<div>
						<h3
							class="text-xs text-neutral-400 mb-4 uppercase tracking-wide select-none"
						>
							Menu
						</h3>
						<ul class="flex flex-wrap gap-x-6 gap-y-3 md:block md:space-y-3">
							<li>
								<a
									href="/"
									class="block text-neutral-600 hover:text-black transition-colors"
								>
									<CornerDownRight
										class="w-3 h-3 hidden md:inline-block text-neutral-300 mr-2"
									/>
									Home
								</a>
							</li>
							<li>
								<a
									href="/projects"
									class="block text-neutral-600 hover:text-black transition-colors"
								>
									<CornerDownRight
										class="w-3 h-3 hidden md:inline-block text-neutral-300 mr-2"
									/>
									Projects
								</a>
							</li>
							<li>
								<a
									href="/writings"
									class="block text-neutral-600 hover:text-black transition-colors"
								>
									<CornerDownRight
										class="w-3 h-3 hidden md:inline-block text-neutral-300 mr-2"
									/>
									Writings
								</a>
							</li>
							<li>
								<a
									href="/labs"
									class="block text-neutral-600 hover:text-black transition-colors"
								>
									<CornerDownRight
										class="w-3 h-3 hidden md:inline-block text-neutral-300 mr-2"
									/>
									Labs
								</a>
							</li>
							<li>
								<a
									href="/uses"
									class="block text-neutral-600 hover:text-black transition-colors"
								>
									<CornerDownRight
										class="w-3 h-3 hidden md:inline-block text-neutral-300 mr-2"
									/>
									Uses
								</a>
							</li>
						</ul>
					</div>
				</nav>
			</div>
		</aside>
	</div>
</main>
<Footer />

<style>
	.post-content {
		--article-body: #444444;
		--article-heading: #0a0a0a;
		--article-muted: #6b6b6b;
		--article-border: #e5e5e5;
		--article-surface: #f5f5f5;

		max-width: 46rem;
		color: var(--article-body);
		font-size: 1.0625rem;
		line-height: 1.82;
	}

	.post-content :global(h1),
	.post-content :global(h2),
	.post-content :global(h3),
	.post-content :global(h4) {
		display: flex;
		align-items: baseline;
		gap: 0.45rem;
		color: var(--article-heading);
		font-weight: 600;
		letter-spacing: -0.02em;
		scroll-margin-top: 4rem;
		text-wrap: balance;
		position: relative;
		padding-left: 0;
		margin-left: 0;
	}

	.post-content :global(.heading-text) {
		min-width: 0;
	}

	.post-content :global(.heading-text > .heading-anchor) {
		color: inherit !important;
		text-decoration: none !important;
		border: 0 !important;
	}

	.post-content :global(.heading-anchor) {
		flex: 0 0 auto;
		color: #c7c7c7 !important;
		text-decoration: none;
		font-weight: 400;
		font-size: 0.65em;
		line-height: 1;
		opacity: 0;
		transform: translateY(-0.02em);
		transition:
			opacity 0.15s ease,
			color 0.15s ease;
	}

	.post-content :global(h1:hover > .heading-anchor),
	.post-content :global(h2:hover > .heading-anchor),
	.post-content :global(h3:hover > .heading-anchor),
	.post-content :global(.heading-anchor:focus-visible) {
		opacity: 1;
	}

	.post-content :global(.heading-anchor:hover),
	.post-content :global(.heading-anchor:focus-visible) {
		color: var(--article-heading) !important;
		outline: none;
	}

	.post-content :global(h1) {
		margin: 3.25rem 0 0.85rem;
		font-size: 1.55rem;
		line-height: 1.22;
	}

	.post-content :global(h2) {
		margin: 3.25rem 0 0.75rem;
		padding-top: 1.35rem;
		border-top: 1px solid var(--article-border);
		font-size: 1.35rem;
		line-height: 1.3;
	}

	.post-content :global(h3) {
		margin: 2.25rem 0 0.55rem;
		font-size: 1.1rem;
		line-height: 1.4;
	}

	.post-content :global(h4) {
		margin: 1.5rem 0 0.5rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.8rem;
		line-height: 1.4;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		font-weight: 600;
	}

	.post-content :global(p) {
		margin: 0 0 1.55rem;
	}

	.post-content :global(a) {
		color: var(--article-heading);
		text-decoration: underline;
		text-decoration-color: #d4d4d4;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.2em;
		transition: text-decoration-color 0.2s ease;
	}

	.post-content :global(a:hover) {
		text-decoration-color: var(--article-heading);
	}

	.post-content :global(strong) {
		color: var(--article-heading);
		font-weight: 600;
	}

	.post-content :global(em) {
		color: var(--article-heading);
	}

	.post-content :global(ul),
	.post-content :global(ol) {
		margin: 0 0 1.35rem 1.25rem;
		padding: 0;
	}

	.post-content :global(ul) {
		list-style-type: disc;
	}

	.post-content :global(ol) {
		list-style-type: decimal;
	}

	.post-content :global(li) {
		margin: 0.35rem 0;
		padding-left: 0.2rem;
	}

	.post-content :global(li > ul),
	.post-content :global(li > ol) {
		margin-top: 0.35rem;
		margin-bottom: 0.35rem;
	}

	.post-content :global(li::marker) {
		color: #b5b5b5;
	}

	.post-content :global(blockquote) {
		margin: 1.75rem 0;
		padding: 0.75rem 1.25rem;
		border-left: 2px solid var(--article-border);
		background: var(--article-surface);
		border-radius: 0 0.25rem 0.25rem 0;
		color: var(--article-muted);
	}

	.post-content :global(blockquote p) {
		margin-bottom: 0.65rem;
	}

	.post-content :global(blockquote p:last-child) {
		margin-bottom: 0;
	}

	.post-content :global(figure.frame) {
		margin: 0;
	}

	.post-content :global(figure:not(.frame)) {
		margin: 2rem 0;
	}

	.post-content :global(figure:not(.frame):first-of-type) {
		margin-top: 0;
		margin-bottom: 2.5rem;
	}

	.post-content :global(img) {
		display: block;
		width: 100%;
		margin: 2.25rem 0;
		border: 1px solid var(--article-border);
		border-radius: 0.5rem;
		background: #fafafa;
	}

	.post-content :global(figcaption:not(.header)) {
		margin-top: -1.25rem;
		color: #8a8a8a;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.post-content :global(code) {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.85em;
		color: var(--article-heading);
		background: var(--article-surface);
		border: 1px solid var(--article-border);
		border-radius: 0.2rem;
		padding: 0.15rem 0.35rem;
	}

	.post-content :global(code::before),
	.post-content :global(code::after) {
		content: none;
	}

	.post-content :global(pre) {
		margin: 2rem 0;
		padding: 1rem 1.15rem;
		overflow-x: auto;
		background: #1f1f1f;
		border: 1px solid #333333;
		border-radius: 0.25rem;
		color: #fafafa;
		font-size: 0.85rem;
		line-height: 1.65;
		box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
	}

	.post-content :global(pre code) {
		background: transparent;
		border: 0;
		color: inherit;
		font-size: inherit;
		padding: 0;
	}

	.post-content :global(figure.frame pre) {
		margin: 0;
	}

	.post-content :global(table) {
		display: block;
		width: 100%;
		margin: 1.75rem 0;
		overflow-x: auto;
		border-collapse: collapse;
		font-size: 0.85rem;
		line-height: 1.6;
	}

	.post-content :global(th),
	.post-content :global(td) {
		padding: 0.65rem 0.85rem;
		border-bottom: 1px solid var(--article-border);
		text-align: left;
	}

	.post-content :global(th) {
		color: var(--article-heading);
		font-weight: 600;
	}

	.post-content :global(td) {
		color: var(--article-body);
	}

	.post-content :global(hr) {
		margin: 3rem 0;
		border: 0;
		border-top: 1px solid var(--article-border);
	}

	.toc-card {
		padding-left: 1rem;
		border-left: 1px solid #e5e5e5;
	}

	:global(.toc-link) {
		text-wrap: balance;
	}

	:global(.toc-link[aria-current='true']) {
		color: #0a0a0a;
	}

	.post-content :global(sup) {
		font-size: 0.7em;
		line-height: 0;
	}

	.post-content :global(.footnotes) {
		margin-top: 3rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--article-border);
		color: var(--article-muted);
		font-size: 0.9rem;
		line-height: 1.7;
	}

	@media (min-width: 640px) {
		.post-content {
			font-size: 1.03125rem;
			line-height: 1.76;
		}

		.post-content :global(h1) {
			font-size: 1.65rem;
		}

		.post-content :global(h2) {
			font-size: 1.4rem;
		}
	}

	@media (min-width: 1024px) {
		.post-content {
			font-size: 1.0625rem;
			line-height: 1.78;
		}

		.post-content :global(h1) {
			font-size: 1.75rem;
		}

		.post-content :global(h2) {
			font-size: 1.45rem;
		}

		.post-content :global(h3) {
			font-size: 1.15rem;
		}
	}

	@media (max-width: 639px) {
		.post-content :global(h2) {
			margin-top: 2.25rem;
		}

		.post-content :global(pre) {
			margin-inline: -0.625rem;
			border-radius: 0;
		}

		.post-content :global(.heading-anchor) {
			display: none;
		}
	}
</style>
