<script>
	import { page } from '$app/stores';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>{$page.status} - Helmy Luqmanulhakim</title>
</svelte:head>

<main
	class="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 md:py-24 min-h-screen text-neutral-900 font-sans"
>
	<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-24">
		<div class="md:col-span-7 lg:col-span-8">
			<header class="mb-12 md:mb-16">
				<a
					href="/"
					class="text-xs text-neutral-400 hover:text-neutral-900 mb-6 md:mb-8 inline-block transition-colors"
				>
					← Back home
				</a>

				<h1 class="text-6xl md:text-8xl font-medium tracking-tighter text-neutral-950 mb-6">
					{$page.status}
				</h1>

				<p class="text-lg text-neutral-500 leading-relaxed font-light max-w-md">
					{#if $page.error}
						{$page.error.message}
					{:else}
						An unknown error occurred.
					{/if}
				</p>
			</header>

			<nav class="md:hidden mt-12 pt-8 border-t border-neutral-100">
				<h3 class="text-xs text-neutral-400 mb-4 uppercase tracking-wide select-none">Menu</h3>
				<div class="flex gap-6 text-sm">
					<a href="/" class="text-neutral-600 hover:text-black transition-colors">Home</a>
					<a href="/projects" class="text-neutral-600 hover:text-black transition-colors"
						>Projects</a
					>
				</div>
			</nav>
		</div>

		<div class="md:col-span-5 lg:col-span-4 md:pl-12 lg:pl-24 space-y-12 hidden md:block">
			<div class="sticky top-24 space-y-12">
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
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
				</div>

				<div>
					<h3 class="text-xs text-neutral-400 mb-6 uppercase tracking-wide select-none">
						Navigation
					</h3>
					<ul class="space-y-2 text-sm">
						<li>
							<a href="/" class="text-neutral-600 hover:text-black transition-colors block py-1">
								Home
							</a>
						</li>
						<li>
							<a
								href="/projects"
								class="text-neutral-600 hover:text-black transition-colors block py-1"
							>
								Projects
							</a>
						</li>
						<li>
							<a
								href="/writings"
								class="text-neutral-600 hover:text-black transition-colors block py-1"
							>
								Writing
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</main>
<Footer />
