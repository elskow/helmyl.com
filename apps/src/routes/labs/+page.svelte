<script lang="ts">
	import type { LabProject } from '$lib/types/labs';
	import Footer from '$lib/components/Footer.svelte';
	import { ArrowUpRight, ArrowLeft, FlaskConical } from '@lucide/svelte';

	interface Props {
		data: { projects: LabProject[] };
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Labs - Helmy Luqmanulhakim</title>
</svelte:head>

<main
	class="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 md:py-24 min-h-screen text-neutral-900 font-sans"
>
	<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-24">
		<div class="md:col-span-7 lg:col-span-8">
			<header class="mb-12 md:mb-20">
				<div class="mb-8">
					<a
						href="/"
						class="text-xs text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1"
					>
						<ArrowLeft class="w-3 h-3" /> Back home
					</a>
				</div>
				<h1 class="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-950 mb-4">Labs</h1>
				<p class="text-lg text-neutral-500 max-w-md leading-relaxed font-light">
					Experiments, demos, and proof-of-concepts.
				</p>
			</header>

			<div class="space-y-0 border-t border-neutral-100">
				{#each data.projects as project}
					<div
						class="group py-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4"
					>
						<div class="flex-1">
							<a href={`/labs/${project.slug}`} class="block group/link">
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
								<p class="text-sm text-neutral-500 max-w-md leading-relaxed">
									{project.description}
								</p>
							</a>
						</div>

						<div class="shrink-0 flex items-center gap-4 text-xs font-mono text-neutral-400">
							{#if project.version}
								<span>v{project.version}</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="md:col-span-5 lg:col-span-4 md:pl-12 lg:pl-24 space-y-16 hidden md:block">
			<div class="sticky top-24 space-y-16">
				<div class="text-neutral-300">
					<FlaskConical class="w-6 h-6" strokeWidth={1.5} />
				</div>

				<div class="text-xs text-neutral-400 leading-relaxed">
					<p>These projects are experimental.</p>
					<p>Expect breaking changes.</p>
				</div>
			</div>
		</div>
	</div>
</main>
<Footer />
