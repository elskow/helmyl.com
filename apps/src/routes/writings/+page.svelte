<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { ArrowLeft, PenLine } from '@lucide/svelte';
	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const posts = data.posts;
	let hoveredSlug = $state<string | null>(null);

	type Post = (typeof posts)[number];
	type GraphNode = {
		id: string;
		title: string;
		topics: string[];
		x: number;
		y: number;
	};

	const formatDate = (value: string) =>
		new Date(value).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});

	const topicRules: Array<[string, string[]]> = [
		['webrtc', ['webrtc', 'websocket', 'video', 'codec', 'rtp', 'network', 'chat']],
		['networking', ['network', 'rtp', 'packet', 'latency', 'hadoop', 'distributed']],
		['data', ['hadoop', 'record', 'data', 'billion', 'mapreduce', '1brc']],
		['systems', ['c ', 'thread', 'concurrency', 'go', 'goroutine', 'performance']],
		['backend', ['go', 'ticket', 'system', 'server', 'dispatcher']],
		['performance', ['performance', 'under 2 seconds', 'thread', 'concurrency', 'billion']],
		['notes', ['sniffing', 'power', 'dog']]
	];

	function getTopics(post: Post) {
		const haystack = `${post.title} ${post.excerpt ?? ''}`.toLowerCase();
		const topics = topicRules
			.filter(([, keywords]) => keywords.some((keyword) => haystack.includes(keyword)))
			.map(([topic]) => topic);

		return topics.length > 0 ? topics.slice(0, 3) : ['writing'];
	}

	const groupedPosts = $derived(
		posts.reduce(
			(acc, post) => {
				const year = new Date(post.date).getFullYear();
				if (!acc[year]) acc[year] = [];
				acc[year].push(post);
				return acc;
			},
			{} as Record<number, Post[]>
		)
	);

	const sortedYears = $derived(Object.keys(groupedPosts).map(Number).sort((a, b) => b - a));

	const graphNodes = $derived(
		posts.map((post, i) => {
			const total = posts.length;
			const angle = (i / (total || 1)) * Math.PI * 2 - Math.PI / 2;
			const radius = 34;
			return {
				id: post.slug,
				title: post.title,
				topics: getTopics(post),
				x: 50 + radius * Math.cos(angle),
				y: 50 + radius * Math.sin(angle)
			};
		})
	);

	const graphEdges = $derived(
		graphNodes.flatMap((source, i) =>
			graphNodes
				.slice(i + 1)
				.filter((target) => source.topics.some((topic) => target.topics.includes(topic)))
				.map((target) => ({ source, target }))
		)
	);

	const topicCounts = $derived(
		Object.entries(
			posts.reduce(
				(acc, post) => {
					for (const topic of getTopics(post)) {
						acc[topic] = (acc[topic] ?? 0) + 1;
					}
					return acc;
				},
				{} as Record<string, number>
			)
		)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 6)
	);

	function isRelated(post: Post) {
		if (!hoveredSlug) return true;
		const hovered = graphNodes.find((node) => node.id === hoveredSlug);
		if (!hovered) return true;
		return post.slug === hoveredSlug || getTopics(post).some((topic) => hovered.topics.includes(topic));
	}

	const pageTitle = 'Writing - Helmy Luqmanulhakim';
	const pageDescription = 'Thoughts on software, infrastructure, and design.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<main
	class="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 md:py-24 min-h-screen text-neutral-900 font-sans"
>
	<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-24">
		<div class="md:col-span-7 lg:col-span-8">
			<header class="mb-12 md:mb-16">
				<a
					href="/"
					class="text-xs text-neutral-400 hover:text-neutral-900 mb-6 md:mb-8 inline-flex items-center gap-1 transition-colors"
				>
					<ArrowLeft class="w-3 h-3" /> Back home
				</a>
				<h1
					class="text-3xl sm:text-4xl font-medium tracking-tight leading-[1.15] text-neutral-950 mb-4"
				>
					Writing
				</h1>
				<p class="text-lg text-neutral-500 leading-relaxed font-light">
					{pageDescription}
				</p>
			</header>

			<div class="space-y-14 mt-8">
				{#each sortedYears as year}
					<section class="relative">
						<div class="md:absolute md:-left-20 md:top-6 mb-4 md:mb-0">
							<span class="font-mono text-xs text-neutral-400 select-none">{year}</span>
						</div>

						<div class="space-y-0 border-t border-neutral-100">
							{#each groupedPosts[year] as post}
								<a
									href="/writings/{post.slug}"
									class="block group py-6 border-b border-neutral-100 last:border-0 transition-opacity duration-200 {hoveredSlug && !isRelated(post) ? 'opacity-35' : ''}"
									onmouseenter={() => (hoveredSlug = post.slug)}
									onmouseleave={() => (hoveredSlug = null)}
									onfocus={() => (hoveredSlug = post.slug)}
									onblur={() => (hoveredSlug = null)}
								>
									<article class="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
										<time class="text-xs text-neutral-400 font-mono shrink-0 w-16">
											{post.date ? formatDate(post.date) : ''}
										</time>

										<div class="min-w-0 flex-1">
											<h2
												class="text-base font-medium text-neutral-900 group-hover:underline decoration-neutral-300 underline-offset-4 transition-all mb-2 break-words"
											>
												{post.title}
											</h2>
											<div
												class="flex flex-wrap gap-x-2 gap-y-1 text-[10px] uppercase tracking-wider font-mono text-neutral-400"
											>
												{#each getTopics(post) as topic}
													<span class="transition-colors group-hover:text-neutral-500">
														{topic}
													</span>
												{/each}
												<span class="text-neutral-300">·</span>
												<span>{post.readTime}</span>
											</div>
										</div>
									</article>
								</a>
							{/each}
						</div>
					</section>
				{/each}
			</div>
		</div>

		<aside
			class="md:col-span-5 lg:col-span-4 md:pl-6 lg:pl-12 xl:pl-24 space-y-8 md:space-y-12 pt-8 md:pt-0 border-t border-neutral-100 md:border-t-0 mt-12 md:mt-0 min-w-0"
		>
			<div class="md:sticky md:top-24 space-y-8 md:space-y-12">
				<div class="hidden md:block text-neutral-300">
					<PenLine class="w-6 h-6" strokeWidth={1.5} />
				</div>

				<nav class="space-y-8 text-sm">
					<div>
						<h3
							class="text-xs text-neutral-400 mb-4 uppercase tracking-wide select-none"
						>
							Graph
						</h3>
						<div class="relative w-full aspect-square max-w-[170px] opacity-90">
							<svg viewBox="0 0 100 100" class="w-full h-full overflow-visible" aria-hidden="true">
								{#each graphEdges as edge}
									<line
										x1={edge.source.x}
										y1={edge.source.y}
										x2={edge.target.x}
										y2={edge.target.y}
										stroke="currentColor"
										stroke-width={hoveredSlug === edge.source.id || hoveredSlug === edge.target.id ? '0.8' : '0.5'}
										class="transition-colors duration-500 {hoveredSlug === edge.source.id || hoveredSlug === edge.target.id ? 'text-neutral-400' : 'text-neutral-100'}"
									/>
								{/each}

								{#each graphNodes as node}
									<circle
										cx={node.x}
										cy={node.y}
										r={hoveredSlug === node.id ? '3' : '1.6'}
										fill="currentColor"
										class="cursor-pointer transition-all duration-300 {hoveredSlug === node.id ? 'text-neutral-800' : 'text-neutral-300 hover:text-neutral-500'}"
										onmouseenter={() => (hoveredSlug = node.id)}
										onmouseleave={() => (hoveredSlug = null)}
									/>
									{#if hoveredSlug === node.id}
										<text
											x={node.x}
											y={node.y - 6}
											text-anchor="middle"
											class="text-[5px] font-mono fill-neutral-600 pointer-events-none"
										>
											{node.title.length > 18 ? `${node.title.slice(0, 18)}…` : node.title}
										</text>
									{/if}
								{/each}
							</svg>
						</div>
						<p class="mt-4 text-xs text-neutral-400 leading-relaxed">
							Posts connect when they share nearby ideas.
						</p>
					</div>

					<div>
						<h3
							class="text-xs text-neutral-400 mb-4 uppercase tracking-wide select-none"
						>
							Topics
						</h3>
						<ul class="space-y-2 text-xs text-neutral-500">
							{#each topicCounts as [topic, count]}
								<li class="flex items-center justify-between gap-4">
									<span>{topic}</span>
									<span class="font-mono text-neutral-400">{count}</span>
								</li>
							{/each}
						</ul>
					</div>
				</nav>
			</div>
		</aside>
	</div>
</main>
<Footer />
