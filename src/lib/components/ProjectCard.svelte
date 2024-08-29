<script lang="ts">
	export let name: string;
	export let description: string;
	export let github: string;
	export let stacks: string[];
</script>

<div class="relative overflow-hidden border-2 border-neutral-500/50 rounded-sm shadow-sm rounded-t-lg p-4">
	<h3 class="font-semibold text-gray-800 ease-in-out transition-colors duration-200">
		{name}
	</h3>
	<p class="line-clamp-3 text-sm mb-2 text-neutral-800">
		{description}
	</p>
	<div class="flex flex-wrap gap-2 pt-2 justify-end pb-2">
		{#each stacks as tech}
			<span class="text-xs px-2 py-1 bg-neutral-100/50 rounded-sm">
				{tech}
			</span>
		{/each}
	</div>
	<a class="absolute bottom-4 left-4 cursor-alias group transition-opacity duration-200 ease-in-out hover:text-blue-600"
		 href={github} rel="noopener noreferrer" target="_blank">
		<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" font-size="16" class="hover:text-info iconify iconify--akar-icons" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
			<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 10.5L21 3m-5 0h5v5m0 6v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"></path>
		</svg>
	</a>
</div>

<style>
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    a {
        transition: opacity 0.2s ease-in-out;
    }

    h3 {
        transition: color 0.2s ease-in-out, text-decoration 0.2s ease-in-out;
    }
</style>