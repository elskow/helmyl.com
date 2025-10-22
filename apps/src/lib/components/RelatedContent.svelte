<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
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
		// Convert stacks to tags for projects
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
		title || (type === 'writings' ? 'Related Articles' : 'Related Projects')
	);

	const getItemTitle = (item: ContentItem) => item.title || item.name || 'Untitled';
	const getItemUrl = (item: ContentItem) => `/${type}/${item.slug}`;
</script>

{#if relatedItems().length > 0}
	<section
		class="mt-12 sm:mt-14 md:mt-16 pt-8 sm:pt-10 md:pt-12 border-t border-dark-200"
		aria-labelledby="related-content-heading"
	>
		<h2
			id="related-content-heading"
			class="text-base sm:text-lg md:text-xl font-semibold mb-6 sm:mb-8 tracking-tight"
		>
			{sectionTitle}
		</h2>

		<div class="space-y-4 sm:space-y-6">
			{#each relatedItems() as item}
				<article>
					<a
						href={getItemUrl(item)}
						class="group block p-4 sm:p-5 md:p-6 border border-dark-200 rounded-lg hover:border-midnight-800 transition-all hover:shadow-sm"
					>
						<div class="flex items-start justify-between gap-4">
							<div class="flex-1 min-w-0">
								<h3
									class="text-sm sm:text-base font-medium mb-2 group-hover:text-midnight-800 transition-colors"
								>
									{getItemTitle(item)}
								</h3>

								{#if item.description}
									<p class="text-xs sm:text-sm text-dark-600 line-clamp-2 mb-3">
										{item.description}
									</p>
								{/if}

								{#if item.tags && item.tags.length > 0}
									<div class="flex flex-wrap gap-2">
										{#each item.tags.slice(0, 3) as tag}
											<span
												class="text-xs px-2 py-0.5 border border-dark-200 rounded-full text-dark-600"
											>
												{tag}
											</span>
										{/each}
									</div>
								{:else if item.stacks && item.stacks.length > 0}
									<div class="flex flex-wrap gap-2">
										{#each item.stacks.slice(0, 3) as stack}
											<span
												class="text-xs px-2 py-0.5 border border-dark-200 rounded-full text-dark-600"
											>
												{stack}
											</span>
										{/each}
									</div>
								{/if}
							</div>

							<div class="shrink-0">
								<ArrowRight
									class="w-4 h-4 sm:w-5 sm:h-5 text-dark-400 group-hover:text-midnight-800 group-hover:translate-x-1 transition-all"
								/>
							</div>
						</div>

						{#if item.date}
							<time
								datetime={item.date}
								class="text-xs text-dark-500 mt-3 block"
							>
								{new Date(item.date).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</time>
						{/if}
					</a>
				</article>
			{/each}
		</div>

		<div class="mt-6 sm:mt-8 text-center">
			<a
				href="/{type}"
				class="inline-flex items-center gap-2 text-xs sm:text-sm text-midnight-800 hover:text-dark-600 transition-colors font-medium"
			>
				View all {type}
				<ArrowRight class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
			</a>
		</div>
	</section>
{/if}
