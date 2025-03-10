<script lang="ts">
	import { getBreadcrumbs } from '$lib/utils/breadcrumbs';

	export let path: string;

	const breadcrumbs = getBreadcrumbs(path);
</script>

{#snippet renderBreadcrumbs()}
	<nav
		class="text-dark-500 dark:text-dark-400 font-medium text-sm line-clamp-1 pr-4 py-2 rounded-md flex items-center flex-wrap"
	>
		<a
			class="text-azure-700 dark:text-azure-400 hover:text-azure-800 dark:hover:text-azure-300 hover:underline transition-all duration-200 ease-in-out inline-flex items-center"
			href="/"
			title="home"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-3 w-3 mr-1"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
				/>
			</svg>
			<span class="align-middle">home</span>
		</a>
		<span class="mx-1.5 sm:mx-2 text-dark-400 dark:text-dark-500 inline-block">/</span>
		{#each breadcrumbs as breadcrumb, index}
			{#if !breadcrumb.isCurrent}
				<a
					href={breadcrumb.url}
					class="text-azure-700 dark:text-azure-400 hover:text-azure-800 dark:hover:text-azure-300 hover:underline transition-all duration-200 ease-in-out align-middle"
					title={breadcrumb.url}
				>
					{breadcrumb.name}
				</a>
			{:else}
				<span class="text-midnight-900 dark:text-dark-200 font-semibold align-middle"
					>{breadcrumb.name}</span
				>
			{/if}
			{#if index < breadcrumbs.length - 1}
				<span class="mx-1.5 sm:mx-2 text-dark-400 dark:text-dark-500 inline-block">/</span>
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
