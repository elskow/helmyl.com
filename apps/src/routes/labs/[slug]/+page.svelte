<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>{data.project.name} - Helmy Luqmanulhakim</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-6 bg-white text-neutral-900 font-sans">
	<div class="w-full max-w-md">
		<nav class="mb-12 text-xs text-neutral-400">
			<a href="/labs" class="hover:text-neutral-900 transition-colors">&larr; Back to Labs</a>
		</nav>

		<header class="mb-8">
			<h1 class="text-2xl font-medium tracking-tight mb-3">
				{data.project.name}
			</h1>
			<p class="text-neutral-500 text-sm leading-relaxed">
				{data.project.description}
			</p>
		</header>

		{#if !data.isAvailable}
			<div class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-sm">
				<p class="text-amber-800 text-sm font-medium mb-1">Lab Unavailable</p>
				<p class="text-amber-700 text-xs">
					This experiment is currently not built or deployed. It may be under development or temporarily unavailable.
				</p>
			</div>
		{/if}

		<div class="space-y-3">
			{#if data.isAvailable}
				<a
					href={data.launchUrl}
					class="w-full px-4 py-3 bg-neutral-900 text-white text-sm font-medium rounded-sm transition-colors flex items-center justify-center gap-2 hover:bg-neutral-800"
				>
					Launch Experiment
				</a>
			{:else}
				<div
					class="w-full px-4 py-3 bg-neutral-300 text-white text-sm font-medium rounded-sm flex items-center justify-center gap-2 cursor-not-allowed"
				>
					Unavailable
				</div>
			{/if}
			<a
				href="/labs"
				class="w-full px-4 py-3 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-sm hover:border-neutral-900 hover:text-neutral-900 transition-colors flex items-center justify-center"
			>
				{data.isAvailable ? 'Cancel' : 'Back to Labs'}
			</a>
		</div>

		<div class="mt-8 pt-8 border-t border-neutral-100 text-center">
			<p class="text-xs text-neutral-400">
				{#if data.isAvailable}
					This experiment runs in an isolated environment.
				{:else}
					Check back later or explore other experiments.
				{/if}
			</p>
		</div>
	</div>
</div>
