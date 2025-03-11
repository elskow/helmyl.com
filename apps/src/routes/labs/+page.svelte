<script lang="ts">
	import type { LabProject } from '$lib/types/labs';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { onMount } from 'svelte';

	interface Props {
		data: { projects: LabProject[] };
	}

	let { data }: Props = $props();
	let isPageLoaded = false;

	onMount(() => {
		isPageLoaded = true;
	});
</script>

<svelte:head>
	<title>Interactive Labs & Experiments | Helmy Luqmanulhakim</title>
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

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:url" content="https://helmyl.com/labs" />
	<meta name="twitter:title" content="Interactive Labs & Experiments | Helmy Luqmanulhakim" />
	<meta
		name="twitter:description"
		content="Explore my hands-on experiments, interactive demos, and technical labs showcasing various technologies in action."
	/>

	<link rel="canonical" href="https://helmyl.com/labs" />
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4 relative">
	<Breadcrumbs path="labs" />

	<!-- Decorative corner element -->
	<div class="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-20 dark:opacity-30">
		<svg
			width="100"
			height="100"
			viewBox="0 0 100 100"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M0 0L100 0L100 100" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" />
			<circle cx="70" cy="30" r="4" fill="currentColor" opacity="0.5" />
			<circle cx="30" cy="70" r="2" fill="currentColor" opacity="0.3" />
		</svg>
	</div>

	<header class="mb-8 md:mb-12 mt-4 md:mt-6 {isPageLoaded ? 'animate-fade-in' : ''}">
		<h1 class="text-2xl md:text-3xl font-bold relative inline-block">
			Interactive Labs
			<div
				class="absolute -bottom-1 left-0 w-1/3 h-1 bg-gradient-to-r from-azure-500/70 dark:from-azure-400/70 to-transparent rounded-full"
			></div>
		</h1>
		<p class="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mt-4">
			Hands-on experiments and interactive demos showcasing various technologies in action.
		</p>
	</header>

	<section>
		<ul
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
			aria-label="Lab projects"
		>
			{#each data.projects as project, i}
				<li
					class="border border-dark-200 dark:border-midnight-700 p-5 rounded-lg transition-all duration-300 hover:border-azure-500/50 dark:hover:border-azure-500/30 hover:shadow-md group relative overflow-hidden bg-white/50 dark:bg-midnight-800/10 backdrop-blur-sm {isPageLoaded
						? 'animate-slide-up'
						: ''}"
					style="animation-delay: {i * 100}ms"
				>
					<!-- Decorative corner accent -->
					<div class="absolute top-0 right-0 w-12 h-12 overflow-hidden">
						<div
							class="absolute transform rotate-45 bg-azure-500/20 dark:bg-azure-400/30 w-16 h-4 -top-2 -right-2 group-hover:bg-azure-500/40 dark:group-hover:bg-azure-400/50 transition-colors duration-300"
						></div>
					</div>

					<div
						class="absolute inset-0 bg-gradient-to-t from-azure-500/5 dark:from-azure-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
					></div>

					<a
						href={`/labs/${project.slug}`}
						class="block h-full w-full absolute inset-0 z-10"
						aria-label={`View ${project.name} project`}
					>
						<span class="sr-only">View {project.name}</span>
					</a>

					<article class="relative z-0">
						<header>
							<h2
								class="text-lg font-semibold text-midnight-800 dark:text-dark-100 group-hover:text-azure-600 dark:group-hover:text-azure-400 transition-colors duration-200 flex items-center"
							>
								{project.name}
							</h2>
						</header>

						<p class="text-sm text-dark-600 dark:text-dark-300 mt-2">{project.description}</p>

						<footer class="mt-3 text-xs text-dark-500 dark:text-dark-400 flex justify-between">
							<div>
								{#if project.author}
									<address class="not-italic flex items-center">
										<svg
											class="w-3.5 h-3.5 mr-1 opacity-70"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
											<circle cx="12" cy="7" r="4"></circle>
										</svg>
										{project.author}
									</address>
								{/if}
							</div>
							<data value={project.version} class="flex items-center">
								<svg
									class="w-3.5 h-3.5 mr-1 opacity-70"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"></path>
									<circle cx="17" cy="7" r="5"></circle>
								</svg>
								{project.version}
							</data>
						</footer>

						<div
							class="mt-3 inline-flex items-center text-azure-600 dark:text-azure-400 hover:underline transition-all duration-200 pointer-events-none"
						>
							<span>View Project</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fill-rule="evenodd"
									d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					</article>

					<!-- Animated border highlight -->
					<div
						class="absolute bottom-0 left-0 w-0 h-0.5 bg-azure-500/70 dark:bg-azure-400/80 group-hover:w-full transition-all duration-700 ease-out"
					></div>
				</li>
			{/each}
		</ul>
	</section>
</main>
<Footer />

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fadeIn 0.8s ease-out forwards;
	}

	.animate-slide-up {
		animation: slideUp 0.5s ease-out forwards;
	}
</style>
