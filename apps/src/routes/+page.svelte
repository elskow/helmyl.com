<script lang="ts">
	import { technologies } from '$lib/technologies';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Footer from '$lib/components/Footer.svelte';

	interface Props {
		data: import('./$types').PageData;
	}

	let { data }: Props = $props();
	const posts = data.posts;
	const projects = data.projects;

	// Experience Data
	const experience = [
		{
			role: 'Application Developer',
			company: 'Bank Central Asia',
			date: 'Mar 2025 — Present',
			link: 'https://www.bca.co.id/'
		},
		{
			role: 'Machine Learning Cohort',
			company: 'Bangkit Academy',
			date: 'Sep 2024 — Jan 2025',
			link: 'https://grow.google/intl/id_id/bangkit/'
		},
		{
			role: 'PowerBI Data Analyst',
			company: 'Biji-biji Initiative',
			date: 'Apr 2024 — May 2024',
			link: 'https://www.biji-biji.com/'
		}
	];

	const pageTitle = 'Helmy Luqmanulhakim - Software Engineer';
	const pageDescription =
		'Software engineer specializing in web development, data engineering, and building scalable solutions.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<main class="max-w-screen-xl mx-auto px-6 py-12 md:py-24 min-h-screen text-neutral-900 font-sans">
	<div class="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
		<div class="md:col-span-7 lg:col-span-8 space-y-24">
			<section class="space-y-8">
				<div class="w-12 h-12 bg-neutral-100 rounded-sm overflow-hidden border border-neutral-200">
					<img
						src="https://avatars.githubusercontent.com/u/103118501?v=4"
						alt="Helmy Luqmanulhakim"
						class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 ease-out"
					/>
				</div>

				<div class="space-y-1">
					<h1 class="text-xl font-medium tracking-tight text-neutral-950">Helmy Luqmanulhakim</h1>
					<p class="text-base text-neutral-500">Software design & engineering</p>
					<p class="text-sm text-neutral-400">South Jakarta, ID</p>
				</div>

				<div class="space-y-4 max-w-lg text-base leading-relaxed text-neutral-600">
					<p>
						I build high-performance web systems and data infrastructure. Currently an Application
						Developer at
						<a
							href="https://www.bca.co.id"
							target="_blank"
							class="text-neutral-900 border-b border-neutral-200 hover:border-neutral-900 transition-colors"
							>Bank Central Asia</a
						>.
					</p>
					<p>Focused on scalability, clean architecture, and developer experience.</p>
				</div>

				<div class="flex gap-4 pt-2">
					<a
						href="https://linkedin.com/in/helmyl"
						target="_blank"
						class="text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-900 px-3 py-2 rounded-sm transition-colors flex items-center gap-1"
					>
						LinkedIn <span class="text-neutral-500">↗</span>
					</a>

					<a
						href="mailto:helmyl.work@gmail.com"
						class="text-xs font-medium border border-neutral-200 hover:border-neutral-900 text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-sm transition-colors flex items-center gap-1"
					>
						Email <span class="text-neutral-400">@</span>
					</a>
				</div>
			</section>

			<section>
				<h2 class="text-neutral-400 text-xs uppercase tracking-wider mb-8 select-none">
					Experience
				</h2>

				<div class="space-y-8">
					{#each experience as job, i}
						<div class="group relative pl-0 md:pl-8">
							<span
								class="absolute left-0 top-1 text-neutral-300 text-xs hidden md:block font-mono select-none"
							>
								{String(i + 1).padStart(2, '0')}
							</span>

							<div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
								<h3 class="text-base font-medium text-neutral-900">
									{job.role}
									<span class="text-neutral-400 font-normal mx-1 text-sm">at</span>
									<a
										href={job.link}
										target="_blank"
										class="hover:text-black hover:underline decoration-neutral-200 underline-offset-4 transition-all"
									>
										{job.company}
									</a>
								</h3>
								<span class="text-xs text-neutral-400 font-mono shrink-0 pt-1 sm:pt-0"
									>{job.date}</span
								>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<section>
				<h2 class="text-neutral-400 text-xs uppercase tracking-wider mb-8 select-none">
					Selected Work
				</h2>

				<div class="space-y-12">
					{#each projects as project, i}
						<div class="relative pl-0 md:pl-8">
							<span
								class="absolute left-0 top-0 text-neutral-300 text-xs hidden md:block font-mono select-none"
							>
								{String(i + 1).padStart(2, '0')}
							</span>
							<ProjectCard {...project} minimal={true} />
						</div>
					{/each}
				</div>

				<div class="mt-10 pl-0 md:pl-8">
					<a
						href="/projects"
						class="inline-flex items-center justify-center px-4 py-2 border border-neutral-200 rounded-sm text-xs font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-all"
					>
						View all projects →
					</a>
				</div>
			</section>

			<section>
				<h2 class="text-neutral-400 text-xs uppercase tracking-wider mb-6 select-none">Stack</h2>
				<div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
					{#each technologies as { name, link }}
						<a
							href={link}
							target="_blank"
							class="hover:text-neutral-900 hover:underline decoration-neutral-200 underline-offset-4 transition-all"
						>
							{name}
						</a>
					{/each}
				</div>
			</section>

			<section>
				<h2 class="text-neutral-400 text-xs uppercase tracking-wider mb-8 select-none">Writing</h2>
				<div class="space-y-6">
					{#each posts as post}
						<a href={`/writings/${post.slug}`} class="block group">
							<article class="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
								<span class="text-xs text-neutral-400 font-mono shrink-0 w-24">{post.date}</span>
								<h3
									class="text-base font-medium text-neutral-900 group-hover:underline decoration-neutral-300 underline-offset-4 transition-all"
								>
									{post.title}
								</h3>
							</article>
						</a>
					{/each}
				</div>

				<div class="mt-8">
					<a
						href="/writings"
						class="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
					>
						Read all articles →
					</a>
				</div>
			</section>
		</div>

		<div class="md:col-span-5 lg:col-span-4 md:pl-12 lg:pl-24 space-y-12">
			<div class="hidden md:block text-neutral-300">
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					><circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path
						d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
					/></svg
				>
			</div>

			<nav class="space-y-8 text-sm">
				<div>
					<h3 class="text-xs text-neutral-400 mb-4 uppercase tracking-wide select-none">Menu</h3>
					<ul class="space-y-3">
						<li>
							<a href="/about" class="block text-neutral-600 hover:text-black transition-colors">
								<span class="text-neutral-300 mr-2 font-mono text-xs">└</span> About
							</a>
						</li>
						<li>
							<a href="/projects" class="block text-neutral-600 hover:text-black transition-colors">
								<span class="text-neutral-300 mr-2 font-mono text-xs">└</span> Projects
							</a>
						</li>
						<li>
							<a href="/writings" class="block text-neutral-600 hover:text-black transition-colors">
								<span class="text-neutral-300 mr-2 font-mono text-xs">└</span> Writings
							</a>
						</li>
						<li>
							<a href="/labs" class="block text-neutral-600 hover:text-black transition-colors">
								<span class="text-neutral-300 mr-2 font-mono text-xs">└</span> Labs
							</a>
						</li>
						<li>
							<a href="/uses" class="block text-neutral-600 hover:text-black transition-colors">
								<span class="text-neutral-300 mr-2 font-mono text-xs">└</span> Uses
							</a>
						</li>
					</ul>
				</div>

				<div>
					<div
						class="inline-flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-2 py-1 rounded-sm text-[10px] uppercase tracking-wider font-medium text-neutral-600"
					>
						<span class="relative flex h-1.5 w-1.5">
							<span
								class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
							></span>
							<span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
						</span>
						Open to work
					</div>
					<div class="mt-4 text-xs text-neutral-400 font-mono space-y-1">
						<p>@helmyl</p>
						<p>Jakarta, WIB (UTC+7)</p>
					</div>
				</div>
			</nav>
		</div>
	</div>
</main>
<Footer />
