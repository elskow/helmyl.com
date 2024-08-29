<script lang="ts">
	export let name: string;
	export let description: string;
	export let github: string;
	export let stacks: string[];
</script>

<div
	class="overflow-hidden border-2 border-neutral-500/50 rounded-sm shadow-sm rounded-t-lg">
	<a class="cursor-alias hover:opacity-70 transition-opacity duration-200 ease-in-out"
		 href={github} rel="noopener noreferrer" target="_blank"
	>
		<div class="p-4">
			<h3 class="font-semibold text-gray-800">{name}</h3>
			<p class="line-clamp-3 text-sm mb-2 text-neutral-800 ">
				{description}
			</p>
			<div class="flex flex-wrap gap-2 pt-2 justify-end pb-2">
				{#each stacks as tech}
					<span class="text-xs px-2 py-1 bg-neutral-100/50 rounded-sm">
						{tech}
					</span>
				{/each}
			</div>
		</div>
	</a>
</div>

<style>
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>