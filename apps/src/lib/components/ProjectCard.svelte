<script lang="ts">
	import { ExternalLink, ArrowUpRight } from '@lucide/svelte';

	interface Props {
		name: string;
		description: string;
		github: string;
		stacks: string[];
		slug: string;
		hasContent?: boolean;
		minimal?: boolean; // New prop to force clean look
	}

	let { name, description, github, stacks, slug, hasContent, minimal = false }: Props = $props();

	const visibleStacks = $derived(stacks.slice(0, 3));
</script>

<article class="group mb-10 last:mb-0">
	<div class="flex items-baseline justify-between mb-2">
		{#if hasContent}
			<a href={`/projects/${slug}`} class="group/link flex items-center gap-1">
				<h3
					class="text-base font-medium text-neutral-900 underline decoration-transparent group-hover/link:decoration-neutral-300 underline-offset-4 transition-all"
				>
					{name}
				</h3>
				<ArrowUpRight
					class="w-3 h-3 text-neutral-400 opacity-0 group-hover/link:opacity-100 transition-opacity"
				/>
			</a>
		{:else}
			<h3 class="text-base font-medium text-neutral-900">
				{name}
			</h3>
		{/if}

		<div class="flex gap-4 text-sm">
			{#if github}
				<a
					href={github}
					target="_blank"
					rel="noopener noreferrer"
					class="text-neutral-400 hover:text-neutral-900 transition-colors text-xs"
				>
					Code
				</a>
			{/if}
		</div>
	</div>

	<div class="block">
		<p class="text-sm text-neutral-600 leading-relaxed mb-3 max-w-lg">
			{description}
		</p>

		<div class="flex flex-wrap gap-3 text-xs text-neutral-400 font-mono">
			{#each visibleStacks as tech, i}
				<span>{tech}{i < visibleStacks.length - 1 ? '' : ''}</span>
			{/each}
		</div>
	</div>
</article>
