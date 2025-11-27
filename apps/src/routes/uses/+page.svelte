<script>
	import { allUses } from 'content-collections';
	import Footer from '$lib/components/Footer.svelte';

	const use = allUses[0];

	const pageTitle = 'Uses - Helmy Luqmanulhakim';
	const pageDescription = 'Hardware, software, and tools I use to get things done.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
</svelte:head>

<main
	class="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 md:py-24 min-h-screen text-neutral-900 font-sans"
>
	<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-24">
		<div class="md:col-span-7 lg:col-span-8">
			<header class="mb-12 md:mb-20">
				<div class="mb-8">
					<a
						href="/"
						class="text-xs text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1"
					>
						← Back home
					</a>
				</div>
				<h1 class="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-950 mb-4">Uses</h1>
				<p class="text-lg text-neutral-500 leading-relaxed font-light">
					{pageDescription}
				</p>
			</header>

			<div class="uses-content">
				{@html use.html}
			</div>

			{#if use.lastModified}
				<div
					class="mt-20 pt-8 border-t border-neutral-100 text-xs text-neutral-400 font-mono flex justify-between items-center"
				>
					<span>Last updated</span>
					<time datetime={use.lastModified}>
						{new Date(use.lastModified).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long'
						})}
					</time>
				</div>
			{/if}

			<nav class="md:hidden mt-12 pt-8 border-t border-neutral-100">
				<h3 class="text-xs text-neutral-400 mb-4 uppercase tracking-wide select-none">Menu</h3>
				<div class="flex flex-wrap gap-6 text-sm">
					<a href="/" class="text-neutral-600 hover:text-black transition-colors">Home</a>
					<a href="/projects" class="text-neutral-600 hover:text-black transition-colors"
						>Projects</a
					>
					<a href="/writings" class="text-neutral-600 hover:text-black transition-colors">Writing</a
					>
				</div>
			</nav>
		</div>

		<div class="md:col-span-5 lg:col-span-4 md:pl-12 lg:pl-24 space-y-16 hidden md:block">
			<div class="sticky top-24 space-y-16">
				<div class="text-neutral-300">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
						<line x1="8" y1="21" x2="16" y2="21" />
						<line x1="12" y1="17" x2="12" y2="21" />
					</svg>
				</div>

				<div>
					<h3 class="text-[10px] text-neutral-400 mb-4 uppercase tracking-widest select-none">
						Categories
					</h3>
					<ul class="space-y-2 text-sm text-neutral-500">
						<li>Workstation</li>
						<li>Development Tools</li>
						<li>Software</li>
						<li>Productivity</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</main>
<Footer />

<style>
	/* Base Content Color */
	:global(.uses-content) {
		color: #525252; /* Neutral-600 */
	}

	/* IMAGES */
	:global(.uses-content img) {
		width: 100%;
		border-radius: 6px;
		margin-bottom: 3rem;
		border: 1px solid #e5e5e5;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
		display: block;
	}

	/* SECTIONS (H2) */
	:global(.uses-content h2) {
		color: #171717; /* Neutral-900 */
		margin-top: 4rem;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid #f5f5f5;
		padding-bottom: 0.5rem;
	}

	/* STANDARD TEXT */
	:global(.uses-content p) {
		margin-bottom: 2rem;
		line-height: 1.75;
		font-weight: 400;
		font-size: 1rem;
	}

	/* --- LISTS (The Spec Sheet Look) --- */
	:global(.uses-content ul) {
		list-style: none;
		padding: 0;
		margin: 0 0 3rem 0;
	}

	/* List Item Container: Flexbox for Alignment */
	:global(.uses-content li) {
		display: flex;
		align-items: baseline;
		padding: 0.6rem 0;
		border-bottom: 1px dashed #e5e5e5;
		gap: 1.5rem; /* Space between Key and Value */
	}

	/* THE KEY (Left Side) - e.g. "Workstation" */
	:global(.uses-content li strong) {
		width: 180px; /* Fixed width for perfect vertical alignment */
		flex-shrink: 0;
		color: #737373; /* Neutral-500 */
		font-weight: 500;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* THE VALUE (Right Side) - e.g. "Macbook Air" */
	/* Implicitly targets text nodes inside LI */
	:global(.uses-content li) {
		color: #171717; /* Neutral-900 */
		font-size: 0.9375rem;
	}

	/* --- FIX FOR NESTED LISTS (e.g. Development Tools) --- */
	/* If an LI contains a UL, we need to break the row layout */
	:global(.uses-content li:has(ul)) {
		flex-direction: column;
		align-items: flex-start;
		border-bottom: none;
		padding-top: 1.5rem;
	}

	/* Style the Group Title differently */
	:global(.uses-content li:has(ul) > strong) {
		width: auto;
		font-size: 0.875rem;
		color: #171717;
		font-weight: 600;
		font-family: sans-serif; /* Match body font for section headers */
		text-transform: none;
		letter-spacing: normal;
		margin-bottom: 0.75rem;
	}

	/* Indent the nested list */
	:global(.uses-content li ul) {
		width: 100%;
		margin-bottom: 0;
		padding-left: 0; /* No indent needed if we use the grid alignment */
	}

	/* Nested Items */
	:global(.uses-content li ul li) {
		border-bottom: 1px dashed #e5e5e5;
		padding: 0.5rem 0;
	}

	/* LINKS */
	:global(.uses-content a) {
		color: #171717;
		text-decoration: underline;
		text-decoration-color: #d4d4d4;
		text-underline-offset: 3px;
		transition: all 0.2s;
	}

	:global(.uses-content a:hover) {
		text-decoration-color: #171717;
		background-color: #f5f5f5;
	}

	/* MOBILE RESPONSIVENESS */
	@media (max-width: 640px) {
		/* On mobile, stack Key and Value vertically */
		:global(.uses-content li) {
			flex-direction: column;
			gap: 0.25rem;
			padding: 1rem 0;
		}

		:global(.uses-content li strong) {
			width: 100%;
			margin-bottom: 0.25rem;
		}
	}
</style>
