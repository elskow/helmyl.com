<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';

	interface Article {
		slug: string;
		title: string;
		date?: string;
		excerpt?: string;
		description?: string;
		tags?: string[];
	}

	interface Props {
		articles: Article[];
		title?: string;
		maxItems?: number;
	}

	let { articles, title = 'Related Articles', maxItems = 3 }: Props = $props();

	const displayArticles = articles.slice(0, maxItems);
</script>

{#if displayArticles.length > 0}
	<aside class="mt-12 sm:mt-14 md:mt-16 pt-8 sm:pt-10 md:pt-12 border-t border-dark-200">
		<h2 class="text-xs sm:text-sm uppercase tracking-wider text-dark-600 mb-4 sm:mb-6">
			{title}
		</h2>

		<div class="space-y-4 sm:space-y-6">
			{#each displayArticles as article}
				<article class="group">
					<a
						href={`/writings/${article.slug}`}
						class="block p-4 sm:p-6 border border-dark-200 rounded-lg hover:border-midnight-800 hover:bg-dark-50/50 transition-all duration-200"
					>
						<div class="flex items-start justify-between gap-4">
							<div class="flex-1 min-w-0">
								<h3
									class="text-sm sm:text-base font-medium mb-2 group-hover:text-midnight-800 transition-colors line-clamp-2"
								>
									{article.title}
								</h3>
								{#if article.excerpt || article.description}
									<p class="text-xs sm:text-sm text-dark-600 line-clamp-2 mb-3">
										{article.excerpt || article.description}
									</p>
								{/if}
								<div class="flex flex-wrap items-center gap-2 sm:gap-3">
									{#if article.date}
										<time
											datetime={new Date(article.date).toISOString()}
											class="text-xs text-dark-500"
										>
											{new Date(article.date).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'short',
												day: 'numeric'
											})}
										</time>
									{/if}
									{#if article.tags && article.tags.length > 0}
										<span class="text-dark-300">•</span>
										<div class="flex flex-wrap gap-1.5">
											{#each article.tags.slice(0, 2) as tag}
												<span
													class="text-xs px-2 py-0.5 bg-dark-100 text-dark-600 rounded-full"
												>
													{tag}
												</span>
											{/each}
											{#if article.tags.length > 2}
												<span class="text-xs text-dark-500">
													+{article.tags.length - 2}
												</span>
											{/if}
										</div>
									{/if}
								</div>
							</div>
							<div
								class="shrink-0 text-midnight-800 opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<ArrowRight class="w-4 h-4 sm:w-5 sm:h-5" />
							</div>
						</div>
					</a>
				</article>
			{/each}
		</div>

		<div class="mt-4 sm:mt-6 text-center">
			<a
				href="/writings"
				class="inline-flex items-center gap-2 text-xs sm:text-sm text-midnight-800 hover:text-dark-600 transition-colors"
			>
				View all articles
				<ArrowRight class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
			</a>
		</div>
	</aside>
{/if}

<style lang="postcss">
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
