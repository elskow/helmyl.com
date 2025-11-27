<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function launchLab() {
		window.location.href = data.launchUrl;
	}

	function goBack() {
		window.location.href = '/labs';
	}

	const labUrl = `https://helmyl.com${data.launchUrl}`;
</script>

<svelte:head>
	<title>{data.project.name} - Helmy Luqmanulhakim</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-6 bg-white text-neutral-900 font-sans">
	<div class="w-full max-w-md">
		<nav class="mb-12 text-xs text-neutral-400">
			<a href="/labs" class="hover:text-neutral-900 transition-colors">← Back to Labs</a>
		</nav>

		<header class="mb-8">
			<h1 class="text-2xl font-medium tracking-tight mb-3">
				{data.project.name}
			</h1>
			<p class="text-neutral-500 text-sm leading-relaxed">
				{data.project.description}
			</p>
		</header>

		<div class="space-y-3">
			<button
				onclick={launchLab}
				class="w-full px-4 py-3 bg-neutral-900 text-white text-sm font-medium rounded-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
			>
				Launch Experiment
			</button>
			<button
				onclick={goBack}
				class="w-full px-4 py-3 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-sm hover:border-neutral-900 hover:text-neutral-900 transition-colors"
			>
				Cancel
			</button>
		</div>

		<div class="mt-8 pt-8 border-t border-neutral-100 text-center">
			<p class="text-xs text-neutral-400">This experiment runs in an isolated environment.</p>
		</div>
	</div>
</div>
