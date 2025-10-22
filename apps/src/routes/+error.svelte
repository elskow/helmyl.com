<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Footer from '$lib/components/Footer.svelte';

	function goHome() {
		goto('/');
	}
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-4">
	{#if $page.error}
		<h1 class="font-semibold text-dark-500 mb-4">{$page.error.message}</h1>
	{:else}
		<h1 class="font-semibold text-dark-500 mb-4">Unknown error occurred</h1>
	{/if}
	<button
		class="mt-4 px-4 py-2 bg-azure-600 text-white rounded-sm transition duration-300 ease-in-out transform hover:bg-azure-700 hover:text-dark-50 active:scale-95"
		onclick={goHome}
	>
		Home
	</button>
	<Footer />
</div>
