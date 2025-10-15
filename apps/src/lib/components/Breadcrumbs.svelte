<script lang="ts">
	import { getBreadcrumbs } from '$lib/utils/breadcrumbs';
	import { Home } from '@lucide/svelte';

	export let path: string;

	const breadcrumbs = getBreadcrumbs(path);
</script>

{#snippet renderBreadcrumbs()}
	<nav
		class="text-dark-500 font-medium text-sm line-clamp-1 pr-4 py-2 rounded-md flex items-center flex-wrap"
	>
		<a
			class="text-azure-700 hover:text-azure-800 hover:underline transition-all duration-200 ease-in-out inline-flex items-center"
			href="/"
			title="home"
		>
			<Home class="h-3 w-3 mr-1" />
			<span class="align-middle">home</span>
		</a>
		<span class="mx-1.5 sm:mx-2 text-dark-400 inline-block">/</span>
		{#each breadcrumbs as breadcrumb, index}
			{#if !breadcrumb.isCurrent}
				<a
					href={breadcrumb.url}
					class="text-azure-700 hover:text-azure-800 hover:underline transition-all duration-200 ease-in-out align-middle"
					title={breadcrumb.url}
				>
					{breadcrumb.name}
				</a>
			{:else}
				<span class="text-midnight-900 font-semibold align-middle">{breadcrumb.name}</span>
			{/if}
			{#if index < breadcrumbs.length - 1}
				<span class="mx-1.5 sm:mx-2 text-dark-400 inline-block">/</span>
			{/if}
		{/each}
	</nav>
{/snippet}

{@render renderBreadcrumbs()}

<style>
	nav {
		position: relative;
		overflow-x: auto;
		white-space: nowrap;
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE and Edge */
	}

	nav::-webkit-scrollbar {
		display: none; /* Chrome, Safari, Opera */
	}
</style>
