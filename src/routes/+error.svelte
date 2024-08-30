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
		<h1 class="font-semibold text-gray-600 mb-4">{$page.error.message}</h1>
	{:else}
		<h1 class="font-semibold text-gray-600 mb-4">Unknown error occurred</h1>
	{/if}
	<button
		class="mt-4 px-4 py-2 bg-gray-600 text-white rounded transition duration-300 ease-in-out transform hover:bg-gray-700 hover:text-gray-100 active:scale-95"
		on:click={goHome}>
		Home
	</button>
	<Footer />
</div>