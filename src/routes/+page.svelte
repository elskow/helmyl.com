<script lang="ts">
	import { blur } from 'svelte/transition';
	import SelfDescription from '$lib/components/SelfDescription.svelte';
	import { allPosts } from 'content-collections';
	import { technologies } from '$lib/technologies';
	import { projects } from '$lib/projects';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Footer from '$lib/components/Footer.svelte';

	const limitedProjects = projects.slice(0, 6);
	const limitedPosts = allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
	const qualities = ['secure', 'scalable', 'fast', 'reliable'];
</script>

<svelte:head>
	<title>Hi, I'm Helmyl</title>
	<meta content="Helmy Luqmanulhakim's personal website" name="description" />
	<meta content="helmy luqmanulhakim, helmyl, software development, data development" name="keywords" />
	<meta content="Helmy Luqmanulhakim" name="author" />
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4" in:blur={{ duration: 500 }}>
	<section>
		<header class="sm:flex sm:justify-between items-center pt-8">
			<h1 class="text-lg sm:text-2xl font-semibold text-gray-800">Helmy Luqmanulhakim</h1>
			<nav class="space-x-4 pt-8 sm:pt-0">
				<a class="text-blue-600 font-medium hover:underline text-sm sm:text-base" href="/writings">Writings</a>
				<a class="text-blue-600 font-medium hover:underline text-sm sm:text-base" href="/uses">Uses</a>
			</nav>
		</header>
		<article class="pt-10 text-sm sm:text-base text-gray-600 space-y-4">
			<p>
				Welcome to my personal corner of the web. Here, I share my journey and insights from my
				experiences in software development and data development.
			</p>
			<p>
				My focus is on crafting solutions that are not only functional but also
				<SelfDescription attributes={qualities} cycleDelay={1500} initialDelay={200} />
			</p>
		</article>
		<section class="pt-10 relative">
			<h2 class="text-base sm:text-lg font-medium text-gray-800 no-gradient">
				Technologies that I use :
			</h2>
			<div class="gradient-overlay-left sm:hidden" />
			<div class="gradient-overlay-right sm:hidden" />
			<div
				class="sm:grid sm:grid-cols-4 gap-7 sm:gap-4 mt-4 text-gray-600 overflow-x-auto flex sm:flex-none no-scrollbar py-4 sm:pl-3 px-3 pr-8 sm:pr-3">
				{#each technologies as { name, icons: Icon, link }}
					<a href={link} target="_blank"
						 class="flex items-center space-x-2 group hover:text-blue-600 transition-colors duration:200 ease-in-out cursor-alias sm:py-4"
						 aria-label={name} rel="noopener noreferrer" title={name}
						 draggable="false">
						<Icon class="w-6 h-6 grayscale filter group-hover:grayscale-0" />
						<span class="block text-xs sm:text-sm">
              {name}
            </span>
					</a>
				{/each}
			</div>
		</section>
		<section>
			<h2 class="text-base sm:text-lg font-medium text-gray-800 pt-10 no-gradient">
				Some Stuff That I've Built
			</h2>
			<div class="mt-4 sm:grid-cols-3 grid gap-2 grid-cols-2">
				{#each limitedProjects as project}
					<ProjectCard {...project} />
				{/each}
			</div>
		</section>
		<section>
			<h2 class="text-base sm:text-lg font-medium text-gray-800 pt-10 no-gradient">
				Recent Writings
			</h2>
			<div class="mt-4">
				{#each limitedPosts as post}
					<article class="text-sm sm:text-base py-4 border-b border-gray-200">
						<h3 class="font-medium text-gray-800">
							<a href={`/writings/${post.slug}`} class="hover:text-blue-600 transition-colors duration-200 ease-in-out"
								 in:blur={{ y: 20, duration: 500 }} out:blur={{ y: -20, duration: 500 }}>
								{post.title}
							</a>
						</h3>
						<div class="flex items-center justify-between text-sm ">
							<p class="text-gray-400 mt-2">
								{post.date}
							</p>
							<p class="text-gray-400 mt-2">
								{post.readTime}
							</p>
						</div>
					</article>
				{/each}
			</div>
		</section>
	</section>
</main>
<Footer />

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }

    .no-scrollbar {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
    }

    .gradient-overlay-left,
    .gradient-overlay-right {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 80px;
        pointer-events: none;
    }

    .gradient-overlay-left {
        left: 0;
        background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
    }

    .gradient-overlay-right {
        right: 0;
        background: linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
    }

    .no-gradient {
        position: relative;
        z-index: 1;
    }
</style>