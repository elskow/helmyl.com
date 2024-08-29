<script lang="ts">
	import { page } from '$app/stores';
	import { allPosts } from 'content-collections';

	const post = allPosts.find((post) => post.slug === $page.params.slug);

	export { post };
</script>

<svelte:head>
	<title>{post?.title}</title>
</svelte:head>

<main class="max-w-4xl mx-auto md:p-8 p-4">
	<article class="pt-8 text-lg text-gray-600 space-y-4">
		<h1 class="text-2xl font-semibold text-gray-800">{post?.title}</h1>
		<p>{post?.date}</p>
		<div class="prose">
			{@html post?.content}
		</div>
	</article>
</main>