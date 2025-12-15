<script>
	import { allAbouts } from 'content-collections';
	import Footer from '$lib/components/Footer.svelte';
	import { ArrowLeft, ArrowUpRight, AtSign, User } from '@lucide/svelte';

	const abouts = allAbouts[0];

	const pageTitle = 'About - Helmy Luqmanulhakim';
	const pageDescription =
		'Software engineer focused on reliable web and data systems. Cloud-native design, performance, and clear architecture.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
</svelte:head>

<main
	class="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 md:py-24 min-h-screen text-neutral-900 font-sans overflow-x-hidden"
>
	<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-24">
		<div class="md:col-span-7 lg:col-span-8">
			<header class="mb-12 md:mb-16">
				<a
					href="/"
					class="text-xs text-neutral-400 hover:text-neutral-900 mb-6 md:mb-8 inline-flex items-center gap-1 transition-colors"
				>
					<ArrowLeft class="w-3 h-3" /> Back home
				</a>
				<h1
					class="text-3xl sm:text-4xl font-medium tracking-tight leading-[1.15] text-neutral-950 mb-4"
				>
					Who am i?
				</h1>
				<p class="text-lg text-neutral-500 leading-relaxed font-light">
					Engineer. Builder. Problem Solver.
				</p>
			</header>

			<article class="about-content">
				{@html abouts.html}
			</article>
		</div>

		<aside class="md:col-span-5 lg:col-span-4 md:pl-6 lg:pl-12 xl:pl-24 space-y-8 md:space-y-12 pt-8 md:pt-0 border-t border-neutral-100 md:border-t-0 mt-12 md:mt-0 min-w-0">
			<div class="md:sticky md:top-24 space-y-8 md:space-y-12">
				<div class="hidden md:block text-neutral-300">
					<User class="w-6 h-6" strokeWidth={1.5} />
				</div>

				<div>
					<h3 class="text-xs text-neutral-400 mb-6 uppercase tracking-wide select-none">Connect</h3>
					<ul class="flex flex-wrap gap-x-6 gap-y-4 md:block md:space-y-4 text-sm">
						<li>
							<a href="https://github.com/helmyl" target="_blank" class="flex items-center gap-2 md:justify-between group"
								><span
									class="text-neutral-900 group-hover:underline decoration-neutral-300 underline-offset-4"
									>GitHub</span
								><ArrowUpRight class="w-3.5 h-3.5 text-neutral-400" /></a
							>
						</li>
						<li>
							<a
								href="https://linkedin.com/in/helmyl"
								target="_blank"
								class="flex items-center gap-2 md:justify-between group"
								><span
									class="text-neutral-900 group-hover:underline decoration-neutral-300 underline-offset-4"
									>LinkedIn</span
								><ArrowUpRight class="w-3.5 h-3.5 text-neutral-400" /></a
							>
						</li>
						<li>
							<a
								href="https://twitter.com/helmy_lh"
								target="_blank"
								class="flex items-center gap-2 md:justify-between group"
								><span
									class="text-neutral-900 group-hover:underline decoration-neutral-300 underline-offset-4"
									>Twitter</span
								><ArrowUpRight class="w-3.5 h-3.5 text-neutral-400" /></a
							>
						</li>
						<li>
							<a href="mailto:contact@helmyl.com" class="flex items-center gap-2 md:justify-between group"
								><span
									class="text-neutral-900 group-hover:underline decoration-neutral-300 underline-offset-4"
									>Email</span
								><AtSign class="w-3.5 h-3.5 text-neutral-400" /></a
							>
						</li>
					</ul>
				</div>
			</div>
		</aside>
	</div>
</main>
<Footer />

<style>
	/* --- MARKDOWN CONTENT STYLING --- */
	:global(.about-content) {
		color: #525252; /* Neutral-600 */
	}

	/* PARAGRAPHS */
	:global(.about-content p) {
		margin-bottom: 1.5rem;
		line-height: 1.8;
		font-weight: 400;
		font-size: 1rem;
	}

	/* LINKS */
	:global(.about-content a) {
		color: #171717;
		font-weight: 500;
		text-decoration: underline;
		text-decoration-color: #d4d4d4;
		text-underline-offset: 3px;
		transition: all 0.2s;
	}
	:global(.about-content a:hover) {
		text-decoration-color: #171717;
		background-color: #f5f5f5;
	}

	/* SECTION HEADINGS (H2, H3 in Markdown) */
	/* We style these to look like "Labels" rather than big shouts */
	:global(.about-content h2),
	:global(.about-content h3) {
		color: #171717; /* Neutral-900 */
		margin-top: 4rem;
		margin-bottom: 1.5rem;
		font-size: 0.875rem; /* small */
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid #f5f5f5;
		padding-bottom: 0.75rem;
	}

	/* LISTS (Skills, Certifications) */
	:global(.about-content ul) {
		margin-bottom: 3rem;
		padding-left: 0;
		list-style-type: none;
	}
	:global(.about-content li) {
		margin-bottom: 0.75rem;
		line-height: 1.6;
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		font-size: 0.9375rem;
	}
	/* Custom bullet point */
	:global(.about-content li::before) {
		content: '·';
		color: #d4d4d4;
		font-weight: bold;
		font-size: 1.5rem; /* Larger bullet */
		line-height: 0;
		position: relative;
		top: 0.2rem;
	}
	/* Bold Text (Keys) */
	:global(.about-content strong) {
		color: #171717;
		font-weight: 500;
	}

	/* --- TABLE STYLING (Crucial for Experience) --- */
	:global(.about-content table) {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
		margin-bottom: 3rem;
		font-size: 0.875rem; /* text-sm */
		text-align: left;
	}

	/* Table Header */
	:global(.about-content thead) {
		border-bottom: 1px solid #e5e5e5;
	}
	:global(.about-content th) {
		padding: 0.75rem 0;
		font-weight: 500;
		text-transform: uppercase;
		font-size: 0.7rem;
		color: #a3a3a3; /* Neutral-400 */
		letter-spacing: 0.05em;
		vertical-align: bottom;
	}

	/* Table Rows */
	:global(.about-content tr) {
		border-bottom: 1px dashed #f5f5f5;
	}
	/* Remove border from last row */
	:global(.about-content tr:last-child) {
		border-bottom: none;
	}

	:global(.about-content td) {
		padding: 1rem 1rem 1rem 0;
		color: #525252;
		vertical-align: top;
	}

	/* --- COLUMN SPECIFIC STYLING --- */
	/* 1. Date Column */
	:global(.about-content td:nth-child(1)) {
		width: 25%;
		color: #a3a3a3;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
		line-height: 1.5;
	}
	/* 2. Role Column */
	:global(.about-content td:nth-child(2)) {
		width: 35%;
		font-weight: 500;
		color: #171717;
	}
	/* 3. Company Column */
	:global(.about-content td:nth-child(3)) {
		width: 40%;
	}

	/* --- RESPONSIVE TABLE (Stacking on Mobile) --- */
	@media (max-width: 640px) {
		:global(.about-content thead) {
			display: none;
		}

		:global(.about-content tr) {
			display: flex;
			flex-direction: column;
			border-bottom: 1px solid #f5f5f5;
			padding-bottom: 1.5rem;
			margin-bottom: 1.5rem;
		}

		:global(.about-content td) {
			display: block;
			width: 100% !important; /* Force full width */
			padding: 0.25rem 0;
			border: none;
		}

		/* Reorder: Date goes to top visually on mobile */
		:global(.about-content td:nth-child(1)) {
			order: -1;
			margin-bottom: 0.25rem;
		}

		/* Role looks like a heading */
		:global(.about-content td:nth-child(2)) {
			font-size: 1rem;
			color: #171717;
			font-weight: 600;
		}
	}
</style>
