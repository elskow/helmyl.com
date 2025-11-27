<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const posts = data.posts;

	const pageTitle = 'Writing - Helmy Luqmanulhakim';
	const pageDescription = 'Thoughts on software, infrastructure, and design.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<main class="max-w-screen-xl mx-auto px-6 py-12 md:py-24 min-h-screen text-neutral-900 font-sans">
	<div class="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
		<div class="md:col-span-7 lg:col-span-8">
			<header class="mb-20">
				<div class="mb-8">
					<a
						href="/"
						class="text-xs text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1"
					>
						← Back home
					</a>
				</div>
				<h1 class="text-lg font-medium tracking-tight text-neutral-950 mb-2">Writing</h1>
				<p class="text-neutral-500 max-w-md text-sm leading-relaxed">
					{pageDescription}
				</p>
			</header>

			<div class="space-y-0 border-t border-neutral-100">
				{#each posts as post}
					<a
						href="/writings/{post.slug}"
						class="block group py-6 border-b border-neutral-100 last:border-0"
					>
						<article class="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
							<time class="text-xs text-neutral-400 font-mono shrink-0 w-24">
								{post.date
									? new Date(post.date).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric'
										})
									: ''}
							</time>

							<div>
								<h2
									class="text-base font-medium text-neutral-900 group-hover:underline decoration-neutral-300 underline-offset-4 transition-all mb-1"
								>
									{post.title}
								</h2>
							</div>
						</article>
					</a>
				{/each}
			</div>
		</div>

		<div class="md:col-span-5 lg:col-span-4 md:pl-12 lg:pl-24 space-y-12 hidden md:block">
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
					><path d="M12 20h9" /><path
						d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
					/></svg
				>
			</div>

			<nav class="space-y-8 text-sm">
				<div>
					<h3 class="text-xs text-neutral-400 mb-4 uppercase tracking-wide select-none">Topics</h3>
					<div class="flex flex-wrap gap-2">
						<span class="text-xs border border-neutral-200 px-2 py-1 rounded text-neutral-500"
							>Engineering</span
						>
						<span class="text-xs border border-neutral-200 px-2 py-1 rounded text-neutral-500"
							>DevOps</span
						>
						<span class="text-xs border border-neutral-200 px-2 py-1 rounded text-neutral-500"
							>Life</span
						>
					</div>
				</div>
			</nav>
		</div>
	</div>
</main>
<Footer />
