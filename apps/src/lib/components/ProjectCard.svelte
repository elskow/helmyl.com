<script lang="ts">
	import { ExternalLink, ChevronRight } from '@lucide/svelte';
	import { browser } from '$app/environment';

	interface Props {
		name: string;
		description: string;
		github: string;
		stacks: string[];
		slug: string;
		hasContent?: boolean;
	}

	let { name, description, github, stacks, slug, hasContent }: Props = $props();

	const visibleStacks = $derived(stacks.slice(0, 3));
	const remainingCount = $derived(stacks.length > 3 ? stacks.length - 3 : 0);
	const hasDetails = $derived(hasContent === true);

	let isTouchDevice = $state(false);

	if (browser) {
		isTouchDevice = window.matchMedia('(hover: none)').matches;
	}
</script>

<article class="group pb-6 sm:pb-8 border-b border-dark-200 last:border-b-0 last:pb-0">
	<div class="flex items-start justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
		{#if hasDetails}
			<a href={`/projects/${slug}`} class="flex-1 min-w-0">
				<h3
					class="text-base sm:text-lg md:text-xl font-semibold text-midnight-800 group-hover:text-azure-600 transition-colors leading-tight tracking-tight"
				>
					{name}
				</h3>
			</a>
		{:else}
			<div class="flex-1 min-w-0">
				<h3
					class="text-base sm:text-lg md:text-xl font-semibold text-midnight-800 leading-tight tracking-tight"
				>
					{name}
				</h3>
			</div>
		{/if}
		{#if github}
			<a
				href={github}
				target="_blank"
				rel="noopener noreferrer"
				class="flex-shrink-0 p-1.5 sm:p-2 text-dark-500 hover:text-azure-600 hover:bg-azure-50 rounded-lg transition-all"
				aria-label={`View ${name} on GitHub`}
			>
				<ExternalLink class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
			</a>
		{/if}
	</div>

	{#if hasDetails}
		<a href={`/projects/${slug}`} class="block group/card">
			<p class="text-xs sm:text-sm text-dark-600 leading-relaxed mb-3 sm:mb-4">
				{description}
			</p>

			<div class="flex items-center justify-between gap-3">
				<div class="flex flex-wrap gap-1.5 sm:gap-2">
					{#each visibleStacks as tech}
						<span
							class="text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-dark-100 text-dark-700 rounded-full"
						>
							{tech}
						</span>
					{/each}
					{#if remainingCount > 0}
						<span
							class="text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-dark-100 text-dark-700 rounded-full"
							title={stacks.slice(3).join(', ')}
						>
							+{remainingCount}
						</span>
					{/if}
				</div>

				<div
					class="flex items-center text-dark-400 group-hover/card:text-azure-600 transition-colors"
				>
					<ChevronRight class="w-4 h-4" />
				</div>
			</div>
		</a>
	{:else}
		<div class="block">
			<p class="text-xs sm:text-sm text-dark-600 leading-relaxed mb-3 sm:mb-4">
				{description}
			</p>

			<div class="flex flex-wrap gap-1.5 sm:gap-2">
				{#each visibleStacks as tech}
					<span
						class="text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-dark-100 text-dark-700 rounded-full"
					>
						{tech}
					</span>
				{/each}
				{#if remainingCount > 0}
					<span
						class="text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-dark-100 text-dark-700 rounded-full"
						title={stacks.slice(3).join(', ')}
					>
						+{remainingCount}
					</span>
				{/if}
			</div>
		</div>
	{/if}
</article>
