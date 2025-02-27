<script lang="ts">
	import type { PageData } from './$types';
	import SEO from '$lib/components/SEO/index.svelte';
	import { getBreadcrumbs } from '$lib/utils/breadcrumbs';

	export let data: PageData;
	const breadcrumbs = getBreadcrumbs(`labs/${data.project.slug}`);

	function refreshPage() {
		window.location.reload();
	}

	function goBack() {
		window.location.href = '/labs';
	}
</script>

<SEO
	title={data.project.name}
	metadescription={data.project.description || `Lab experiment: ${data.project.name}`}
/>

<div class="fixed inset-0 bg-white dark:bg-slate-950">
	<nav class="text-gray-600 dark:text-gray-400 font-medium text-sm line-clamp-1 p-4">
		<a
			class="text-blue-800 dark:text-blue-400 hover:text-gray-800 dark:hover:text-gray-200 hover:text-bold cursor-pointer transition-colors duration-200 ease-in-out"
			href="/"
			title="home">home</a
		>
		<span class="mx-0.5 sm:mx-1">/</span>
		{#each breadcrumbs as breadcrumb, index}
			{#if !breadcrumb.isCurrent}
				<a
					href={breadcrumb.url}
					class="text-blue-800 dark:text-blue-400 hover:text-gray-800 dark:hover:text-gray-200 hover:text-bold cursor-pointer transition-colors duration-200 ease-in-out"
					title={breadcrumb.url}
				>
					{breadcrumb.name}
				</a>
			{:else}
				<span class="text-neutral-950 dark:text-neutral-200">{breadcrumb.name}</span>
			{/if}
			{#if index < breadcrumbs.length - 1}
				<span class="mx-1">/</span>
			{/if}
		{/each}
	</nav>

	<div class="flex items-center justify-center h-[calc(100vh-4rem)]">
		<div class="text-center p-8 max-w-md">
			<h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
				{data.project.name}
			</h1>
			<p class="text-gray-600 dark:text-gray-400 mb-8">
				{data.project.description}
			</p>
			<div class="space-y-4">
				<button
					on:click={refreshPage}
					class="w-full px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded transition duration-300 ease-in-out transform hover:bg-gray-700 dark:hover:bg-gray-600 hover:text-gray-100 active:scale-95"
				>
					Launch Lab
				</button>
				<button
					on:click={goBack}
					class="w-full px-4 py-2 border-2 border-gray-600 dark:border-gray-400 text-gray-600 dark:text-gray-400 rounded transition duration-300 ease-in-out transform hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
				>
					Back to Labs
				</button>
			</div>
		</div>
	</div>
</div>
