<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import { generateRelatedContent } from '$lib/utils/seo';

	interface ContentItem {
		slug: string;
		title?: string;
		name?: string;
		description?: string;
		tags?: string[];
		date?: string;
		stacks?: string[];
	}

	interface Props {
		currentItem: ContentItem;
		allItems: ContentItem[];
		type?: 'writings' | 'projects';
		limit?: number;
		title?: string;
	}

	let { currentItem, allItems, type = 'writings', limit = 3, title }: Props = $props();

	const relatedItems = $derived(() => {
		const itemWithTags = {
			...currentItem,
			tags: currentItem.tags || currentItem.stacks || []
		};
		const allWithTags = allItems.map((item) => ({
			...item,
			tags: item.tags || item.stacks || []
		}));
		return generateRelatedContent(itemWithTags, allWithTags, limit);
	});

	const sectionTitle = $derived(
		title || (type === 'writings' ? 'Further Reading' : 'Related Projects')
	);

	const getItemTitle = (item: ContentItem) => item.title || item.name || 'Untitled';
	const getItemUrl = (item: ContentItem) => `/${type}/${item.slug}`;
</script>

{#if relatedItems().length > 0}
	<section class="mt-24 pt-12 border-t border-neutral-100">
		<div class="flex items-baseline justify-between mb-8">
			<h2 class="text-xs text-neutral-400 uppercase tracking-wider select-none">
				{sectionTitle}
			</h2>
			<a href="/{type}" class="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">
				View all
			</a>
		</div>

		<div class="space-y-8">
			{#each relatedItems() as item, i}
				<div class="relative pl-0 group">
					<span class="absolute -left-8 top-0 text-neutral-300 text-xs hidden md:block select-none">
						{i === 0 ? 'I.' : i === 1 ? 'II.' : i === 2 ? 'III.' : ''}
					</span>

					<a href={getItemUrl(item)} class="block">
						<div class="flex items-baseline justify-between mb-1">
							<h3
								class="text-sm font-medium text-neutral-900 group-hover:underline underline-offset-4 decoration-neutral-300 transition-all"
							>
								{getItemTitle(item)}
							</h3>
							<ArrowUpRight
								class="w-3 h-3 text-neutral-300 group-hover:text-neutral-900 transition-colors"
							/>
						</div>
						{#if item.description}
							<p class="text-sm text-neutral-500 line-clamp-2 max-w-md">
								{item.description}
							</p>
						{/if}
					</a>
				</div>
			{/each}
		</div>
	</section>
{/if}
