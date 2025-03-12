<script lang="ts">
	import type { LabProject } from '$lib/types/labs';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { onMount } from 'svelte';
	import { CornerRightUp, User, Tag, ArrowRight } from '@lucide/svelte';
	import { browser } from '$app/environment';

	interface Props {
		data: { projects: LabProject[] };
	}

	let { data }: Props = $props();
	let isPageLoaded = $state(false);
	let isTouchDevice = $state(false);

	onMount(() => {
		isPageLoaded = true;

		if (browser) {
			isTouchDevice = window.matchMedia('(hover: none)').matches;
		}
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
	<div
		class="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-20 dark:opacity-30 flex items-center justify-center"
	>
		<svg
			width="90"
			height="90"
			viewBox="0 0 100 100"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="transform -translate-x-1 -translate-y-1"
		>
			<path d="M5 5L95 5L95 95" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" />
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
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
			aria-label="Lab projects"
		>
			{#each data.projects as project, i}
				<li
					class="border border-dark-200 dark:border-midnight-700 p-3 sm:p-4 md:p-5 rounded-lg transition-all duration-300 hover:border-azure-500/50 dark:hover:border-azure-500/30 hover:shadow-md group relative overflow-hidden bg-white/50 dark:bg-midnight-800/10 backdrop-blur-sm {isPageLoaded
						? 'animate-slide-up'
						: ''} {isTouchDevice ? 'touch-item' : ''}"
					style="animation-delay: {i * 100}ms"
				>
					<div
						class="absolute top-0 right-0 w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 overflow-hidden"
					>
						<div
							class="absolute transform rotate-45 bg-azure-500/20 dark:bg-azure-400/30 w-12 sm:w-14 md:w-16 h-3 sm:h-4 -top-2 -right-2 {isTouchDevice
								? 'bg-azure-500/30 dark:bg-azure-400/40'
								: 'group-hover:bg-azure-500/40 dark:group-hover:bg-azure-400/50'} transition-colors duration-300"
						></div>
					</div>

					<div
						class="absolute inset-0 bg-gradient-to-t from-azure-500/5 dark:from-azure-400/10 to-transparent {isTouchDevice
							? 'opacity-30'
							: 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300 pointer-events-none"
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
								class="text-base sm:text-lg font-semibold text-midnight-800 dark:text-dark-100 {isTouchDevice
									? 'text-azure-600/80 dark:text-azure-400/80'
									: 'group-hover:text-azure-600 dark:group-hover:text-azure-400'} transition-colors duration-200 flex items-center line-clamp-1"
							>
								{project.name}
							</h2>
						</header>

						<p
							class="text-xs sm:text-sm text-dark-600 dark:text-dark-300 mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3"
						>
							{project.description}
						</p>

						<footer
							class="mt-2 sm:mt-3 text-xs text-dark-500 dark:text-dark-400 flex justify-between"
						>
							<div>
								{#if project.author}
									<address class="not-italic flex items-center">
										<User class="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 opacity-70" />
										<span class="truncate max-w-[80px] sm:max-w-[120px]">{project.author}</span>
									</address>
								{/if}
							</div>
							<data value={project.version} class="flex items-center">
								<Tag class="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 opacity-70" />
								{project.version}
							</data>
						</footer>

						<div
							class="mt-2 sm:mt-3 inline-flex items-center text-azure-600 dark:text-azure-400 hover:underline transition-all duration-200 pointer-events-none text-xs sm:text-sm"
						>
							<span>View Project</span>
							<ArrowRight
								class="h-3 w-3 sm:h-4 sm:w-4 ml-1 transform {isTouchDevice
									? 'translate-x-0.5'
									: 'group-hover:translate-x-1'} transition-transform duration-200"
							/>
						</div>
					</article>

					<!-- Animated border highlight -->
					<div
						class="absolute bottom-0 left-0 {isTouchDevice
							? 'w-1/3'
							: 'w-0 group-hover:w-full'} h-0.5 bg-azure-500/70 dark:bg-azure-400/80 transition-all duration-700 ease-out"
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

	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.touch-item {
		border-color: rgba(59, 130, 246, 0.2);
	}

	.touch-item:active {
		background-color: rgba(59, 130, 246, 0.05);
		border-color: rgba(59, 130, 246, 0.4);
		transform: translateY(-1px);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.touch-item .absolute.bottom-0.left-0 {
		transition-duration: 0.3s;
	}

	.touch-item:active .absolute.bottom-0.left-0 {
		width: 100%;
	}

	.touch-item * {
		transition-duration: 0.15s;
	}
</style>
