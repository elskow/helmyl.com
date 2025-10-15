<script lang="ts">
	import { getBreadcrumbs } from '$lib/utils/breadcrumbs';
	import { ChevronRight } from '@lucide/svelte';

	export let path: string;

	const breadcrumbs = getBreadcrumbs(path);
</script>

<nav class="flex items-center text-sm text-dark-600 mb-8" aria-label="Breadcrumb">
	<a href="/" class="hover:text-midnight-800 transition-colors"> Home </a>
	{#each breadcrumbs as breadcrumb, index}
		<ChevronRight class="w-4 h-4 mx-2" />
		{#if !breadcrumb.isCurrent}
			<a href={breadcrumb.url} class="hover:text-midnight-800 transition-colors">
				{breadcrumb.name}
			</a>
		{:else}
			<span class="text-midnight-800 font-medium">
				{breadcrumb.name}
			</span>
		{/if}
	{/each}
</nav>
