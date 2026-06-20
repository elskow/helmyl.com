<script lang="ts">
	import type { LabProject } from '$lib/types/labs';
	import Footer from '$lib/components/Footer.svelte';
	import { ArrowUpRight, ArrowLeft, FlaskConical } from '@lucide/svelte';

	interface Props {
		data: { projects: LabProject[] };
	}

	let { data }: Props = $props();

	const latestEditedAt = $derived(data.projects[0]?.editedAt);
	const parseLabDate = (value: string) => {
		const normalized = value.replace(
			/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/,
			'$1T$2$3:$4'
		);
		const date = new Date(normalized);
		return Number.isFinite(date.getTime()) ? date : null;
	};

	const formatEditedAt = (value: string) => {
		const date = parseLabDate(value);
		if (!date) return 'Unknown';
		return new Intl.DateTimeFormat('en', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	};

	const labMeta: Record<string, { categories: string[] }> = {
		blackhole: { categories: ['graphics', 'webgl', 'physics'] },
		gbemu: { categories: ['game', 'wasm', 'systems'] },
		'marble-run': { categories: ['graphics', 'webgl', 'physics'] },
		'rotating-donut': { categories: ['graphics', 'webgl', '3d'] },
		'space-shooter': { categories: ['game', 'canvas', 'arcade'] },
		'uiia-cat': { categories: ['graphics', '3d', 'model'] }
	};

	const getCategories = (slug: string) => labMeta[slug]?.categories || ['experiment'];

	const graphNodes = $derived(data.projects.map((p, i) => {
		const cats = getCategories(p.slug);
		const total = data.projects.length;
		const MathPI2 = Math.PI * 2;
		const angle = (i / (total || 1)) * MathPI2 - Math.PI / 2;
		const r = 35;
		return {
			id: p.slug,
			name: p.name,
			cats,
			x: 50 + r * Math.cos(angle),
			y: 50 + r * Math.sin(angle)
		};
	}));

	const graphEdges = $derived(
		graphNodes.flatMap((n1, i) =>
			graphNodes.slice(i + 1).filter(n2 =>
				n1.cats.some(c => n2.cats.includes(c))
			).map(n2 => ({ source: n1, target: n2 }))
		)
	);

	let hoveredSlug = $state<string | null>(null);
</script>

<svelte:head>
	<title>Labs - Helmy Luqmanulhakim</title>
</svelte:head>

<main
	class="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 md:py-24 min-h-screen text-neutral-900 font-sans"
>
	<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-24">
		<div class="md:col-span-7 lg:col-span-8">
			<header class="mb-12 md:mb-20">
				<div class="mb-8">
					<a
						href="/"
						class="text-xs text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1 w-fit"
					>
						<ArrowLeft class="w-3 h-3" /> Back home
					</a>
				</div>
				<h1 class="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-950 mb-4">
					Labs
				</h1>
				<p class="text-lg text-neutral-500 max-w-md leading-relaxed font-light">
					Experiments, demos, and proof-of-concepts. Newest edits appear first.
				</p>
			</header>

			<div class="space-y-0 border-t border-neutral-100">
				{#each data.projects as project}
					<div
						class="group py-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4"
					>
						<div class="flex-1">
							<a
								href={`/labs/${project.slug}`}
								class="block group/link rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-neutral-200"
								onmouseenter={() => hoveredSlug = project.slug}
								onmouseleave={() => hoveredSlug = null}
								onfocus={() => hoveredSlug = project.slug}
								onblur={() => hoveredSlug = null}
							>
								<div class="flex items-center gap-2 mb-2">
									<h2
										class="text-base font-medium text-neutral-900 group-hover/link:underline decoration-neutral-300 underline-offset-4 transition-all"
									>
										{project.name}
									</h2>
									<ArrowUpRight
										class="w-3.5 h-3.5 text-neutral-300 group-hover/link:text-neutral-900 transition-colors"
									/>
								</div>
								<p class="text-sm text-neutral-500 max-w-md leading-relaxed mb-3">
									{project.description}
								</p>
								<div class="flex flex-wrap gap-x-2 gap-y-1 text-[10px] uppercase tracking-wider font-mono text-neutral-400">
									{#each getCategories(project.slug) as cat}
										<span class="transition-colors group-hover/link:text-neutral-500">
											{cat}
										</span>
									{/each}
								</div>
							</a>
						</div>

						<div class="shrink-0 flex items-center gap-4 text-xs font-mono text-neutral-400 mt-2 sm:mt-0">
							<span>{formatEditedAt(project.editedAt)}</span>
							{#if project.version}
								<span>v{project.version}</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<aside class="md:col-span-5 lg:col-span-4 md:pl-6 lg:pl-12 xl:pl-24 pt-8 md:pt-0 border-t border-neutral-100 md:border-t-0 mt-12 md:mt-0 min-w-0">
			<div class="md:sticky md:top-24 space-y-8 md:space-y-12">
				<div class="hidden md:block text-neutral-300">
					<FlaskConical class="w-6 h-6" strokeWidth={1.5} />
				</div>

				<div class="relative w-full aspect-square max-w-[160px] md:max-w-[180px] opacity-90 mx-auto md:mx-0">
					<svg viewBox="0 0 100 100" class="w-full h-full overflow-visible" aria-hidden="true">
						{#each graphEdges as edge}
							<line
								x1={edge.source.x} y1={edge.source.y}
								x2={edge.target.x} y2={edge.target.y}
								stroke="currentColor"
								stroke-width={hoveredSlug === edge.source.id || hoveredSlug === edge.target.id ? "0.75" : "0.5"}
								class="transition-colors duration-500 {hoveredSlug === edge.source.id || hoveredSlug === edge.target.id ? 'text-neutral-400' : 'text-neutral-100'}"
							/>
						{/each}

						{#each graphNodes as node}
							<circle
								cx={node.x} cy={node.y}
								r={hoveredSlug === node.id ? "3" : "1.5"}
								fill="currentColor"
								class="transition-all duration-300 {hoveredSlug === node.id ? 'text-neutral-800' : 'text-neutral-300'}"
							/>
							{#if hoveredSlug === node.id}
								<text
									x={node.x} y={node.y - 6}
									text-anchor="middle"
									class="text-[5px] font-mono fill-neutral-600 transition-opacity"
								>
									{node.name}
								</text>
							{/if}
						{/each}
					</svg>
				</div>

				<div class="text-xs text-neutral-400 leading-relaxed space-y-2">
					<p>These projects are experimental.</p>
					<p>Sorted by latest edited time.</p>
					{#if latestEditedAt}
						<p>Latest edit: {formatEditedAt(latestEditedAt)}</p>
					{/if}
				</div>
			</div>
		</aside>
	</div>
</main>
<Footer />
