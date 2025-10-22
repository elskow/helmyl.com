<script lang="ts">
	import type { LabProject } from '$lib/types/labs';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { User, Tag } from '@lucide/svelte';

	interface Props {
		data: { projects: LabProject[] };
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Labs - Helmy Luqmanulhakim</title>
	<meta
		name="description"
		content="Explore my hands-on experiments, interactive demos, and technical labs showcasing various technologies in action."
	/>
	<meta
		name="keywords"
		content="web experiments, interactive demos, tech labs, code playground, Helmy Luqmanulhakim"
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://helmyl.com/labs" />
	<meta property="og:title" content="Interactive Labs & Experiments | Helmy Luqmanulhakim" />
	<meta
		property="og:description"
		content="Explore my hands-on experiments, interactive demos, and technical labs showcasing various technologies in action."
	/>
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />
	<meta property="og:image" content="https://helmyl.com/og/labs.png" />
	<meta property="og:image:alt" content="Interactive Labs & Experiments" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://helmyl.com/labs" />
	<meta name="twitter:title" content="Interactive Labs & Experiments | Helmy Luqmanulhakim" />
	<meta
		name="twitter:description"
		content="Explore my hands-on experiments, interactive demos, and technical labs showcasing various technologies in action."
	/>
	<meta name="twitter:image" content="https://helmyl.com/og/labs.png" />
	<meta name="twitter:image:alt" content="Interactive Labs & Experiments" />

	<link rel="canonical" href="https://helmyl.com/labs" />
</svelte:head>

<main class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 min-h-screen">
	<Breadcrumbs path="labs" />

	<header class="mb-8 sm:mb-10 md:mb-12">
		<h1 class="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 tracking-tight">
			Labs
		</h1>
		<p class="text-xs sm:text-sm md:text-base text-dark-600">
			Interactive experiments and demos showcasing various technologies.
		</p>
	</header>

	<section>
		<ul class="space-y-4 sm:space-y-6" aria-label="Lab projects">
			{#each data.projects as project}
				<li
					class="border border-dark-200 p-4 sm:p-5 rounded-sm hover:border-azure-500 transition-colors"
				>
					<a href={`/labs/${project.slug}`} class="block">
						<article>
							<header>
								<h2
									class="text-base sm:text-lg font-semibold mb-2 text-midnight-800 hover:text-azure-600 transition-colors"
								>
									{project.name}
								</h2>
							</header>

							<p class="text-xs sm:text-sm text-dark-600 leading-relaxed">
								{project.description}
							</p>

							<footer
								class="mt-3 sm:mt-4 text-xs text-dark-500 flex justify-between items-center"
							>
								<div class="flex gap-3">
									{#if project.author}
										<address class="not-italic flex items-center gap-1">
											<User class="w-3.5 h-3.5" />
											{project.author}
										</address>
									{/if}
									<data value={project.version} class="flex items-center gap-1">
										<Tag class="w-3.5 h-3.5" />
										{project.version}
									</data>
								</div>
							</footer>
						</article>
					</a>
				</li>
			{/each}
		</ul>
	</section>
</main>
<Footer />
