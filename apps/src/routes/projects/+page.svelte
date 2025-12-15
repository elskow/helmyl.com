<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { ArrowUpRight, ArrowLeft, LayoutPanelLeft } from '@lucide/svelte';

	interface Props {
		data: import('./$types').PageData;
	}

	interface Project {
		name: string;
		description: string;
		github: string;
		stacks: string[];
		date: string;
		priority?: number;
		slug: string;
		lastModified: string;
		hasContent: boolean;
	}

	let { data }: Props = $props();
	const projects = data.projects as Project[];

	const groupedProjects = projects.reduce(
		(acc, project: Project) => {
			const year = new Date(project.date).getFullYear();
			if (!acc[year]) acc[year] = [];
			acc[year].push(project);
			return acc;
		},
		{} as Record<number, Project[]>
	);

	const sortedYears = Object.entries(groupedProjects).sort(([a], [b]) => Number(b) - Number(a));
</script>

<svelte:head>
	<title>Projects - Helmy Luqmanulhakim</title>
	<meta name="description" content="Selected works, open source contributions, and tools." />
</svelte:head>

<main
	class="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 md:py-24 min-h-screen text-neutral-900 font-sans overflow-x-hidden"
>
	<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-24">
		<div class="md:col-span-7 lg:col-span-8">
			<header class="mb-20 md:mb-32">
				<div class="mb-8">
					<a
						href="/"
						class="text-xs text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1"
					>
						<ArrowLeft class="w-3 h-3" /> Back home
					</a>
				</div>

				<h1 class="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-950 mb-4">
					Projects
				</h1>
				<p class="text-lg text-neutral-500 max-w-md leading-relaxed font-light">
					Selected works, open source contributions, and developer tools.
				</p>
			</header>

			<div class="space-y-24">
				{#each sortedYears as [year, yearProjects]}
					<section class="relative">
						<div class="md:absolute md:-left-32 md:top-0 mb-6 md:mb-0">
							<span class="font-mono text-xs text-neutral-400 select-none">{year}</span>
						</div>

						<div class="border-l border-neutral-100 pl-8 md:pl-10 space-y-16">
							{#each yearProjects as project}
								<article class="group relative">
									<div
										class="absolute -left-[37px] md:-left-[45px] top-2.5 w-1.5 h-1.5 rounded-full bg-neutral-200 ring-4 ring-white group-hover:bg-neutral-400 transition-colors duration-300"
									></div>

									<a
										href={project.hasContent ? `/projects/${project.slug}` : project.github}
										class="block"
										target={project.hasContent ? '_self' : '_blank'}
									>
										<div class="flex items-start justify-between gap-4 mb-3">
											<h2
												class="text-base font-medium text-neutral-900 group-hover:underline decoration-neutral-300 underline-offset-4 transition-all"
											>
												{project.name}
											</h2>

											<div
												class="shrink-0 text-neutral-300 group-hover:text-neutral-900 transition-colors"
											>
												{#if !project.hasContent}
													<div
														class="flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium opacity-0 group-hover:opacity-100 transition-opacity"
													>
														<span>Code</span>
														<ArrowUpRight class="w-3 h-3" />
													</div>
												{:else}
													<ArrowUpRight class="w-3.5 h-3.5" />
												{/if}
											</div>
										</div>

										<p class="text-sm text-neutral-500 leading-relaxed mb-5 max-w-lg">
											{project.description}
										</p>

										<div class="flex flex-wrap gap-2">
											{#each project.stacks.slice(0, 5) as stack}
												<span
													class="text-[10px] px-2 py-1 bg-neutral-50 text-neutral-500 rounded-sm border border-neutral-100 font-medium tracking-wide"
												>
													{stack}
												</span>
											{/each}
										</div>
									</a>
								</article>
							{/each}
						</div>
					</section>
				{/each}
			</div>
		</div>

		<aside class="md:col-span-5 lg:col-span-4 md:pl-6 lg:pl-12 xl:pl-24 space-y-8 md:space-y-16 pt-8 md:pt-0 border-t border-neutral-100 md:border-t-0 mt-12 md:mt-0 min-w-0">
			<div class="md:sticky md:top-24 space-y-8 md:space-y-16">
				<div class="hidden md:block text-neutral-300">
					<LayoutPanelLeft class="w-6 h-6" strokeWidth={1.5} />
				</div>

				<div>
					<h3 class="text-[10px] text-neutral-400 mb-4 uppercase tracking-widest select-none">
						Focus
					</h3>
					<ul class="flex flex-wrap gap-x-6 gap-y-2 md:block md:space-y-2 text-sm text-neutral-500">
						<li>Infrastructure</li>
						<li>Web Development</li>
						<li>Data Engineering</li>
						<li>Developer Tools</li>
					</ul>
				</div>
			</div>
		</aside>
	</div>
</main>
<Footer />
