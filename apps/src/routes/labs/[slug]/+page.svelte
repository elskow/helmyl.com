<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const breadcrumbPath = `labs/${data.project.slug}`;

	function refreshPage() {
		window.location.reload();
	}

	function goBack() {
		window.location.href = '/labs';
	}

	const labUrl = `https://helmyl.com/labs/${data.project.slug}`;
</script>

<svelte:head>
	<title>{data.project.name} | Lab Experiment | Helmy Luqmanulhakim</title>
	<meta
		name="description"
		content={data.project.description ||
			`Interactive experiment demonstrating ${data.project.name} in action.`}
	/>
	<meta
		name="keywords"
		content={`${data.project.name}, interactive experiment, tech demo, Helmy Luqmanulhakim`}
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={labUrl} />
	<meta property="og:title" content={`${data.project.name} | Lab Experiment`} />
	<meta
		property="og:description"
		content={data.project.description ||
			`Interactive experiment demonstrating ${data.project.name} in action.`}
	/>
	<meta property="og:site_name" content="Helmy Luqmanulhakim" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:url" content={labUrl} />
	<meta name="twitter:title" content={`${data.project.name} | Lab Experiment`} />
	<meta
		name="twitter:description"
		content={data.project.description ||
			`Interactive experiment demonstrating ${data.project.name} in action.`}
	/>

	<link rel="canonical" href={labUrl} />
</svelte:head>

<div class="fixed inset-0 bg-white dark:bg-midnight-950">
	<div class="p-4">
		<Breadcrumbs path={breadcrumbPath} />
	</div>

	<div class="flex items-center justify-center h-[calc(100vh-4rem)]">
		<div class="text-center p-8 max-w-md">
			<h1 class="text-2xl font-bold mb-4 text-midnight-800 dark:text-dark-100">
				{data.project.name}
			</h1>
			<p class="text-dark-600 dark:text-dark-300 mb-8">
				{data.project.description}
			</p>
			<div class="space-y-4">
				<button
					onclick={refreshPage}
					class="w-full px-4 py-2 bg-azure-600 dark:bg-azure-700 text-white rounded transition duration-300 ease-in-out transform hover:bg-azure-700 dark:hover:bg-azure-600 hover:text-dark-50 active:scale-95"
				>
					Launch Lab
				</button>
				<button
					onclick={goBack}
					class="w-full px-4 py-2 border-2 border-dark-400 dark:border-dark-500 text-dark-600 dark:text-dark-300 rounded transition duration-300 ease-in-out transform hover:bg-dark-100 dark:hover:bg-midnight-800 active:scale-95"
				>
					Back to Labs
				</button>
			</div>
		</div>
	</div>
</div>
