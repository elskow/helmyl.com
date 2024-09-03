<script>
	import Footer from '$lib/components/Footer.svelte';
	import {getBreadcrumbs} from '$lib/utils/breadcrumbs.js';
	import SEO from '$lib/components/SEO/index.svelte';

	/** @type {import('./$types').PageData} */
    export let data;
    const posts = data.posts;
</script>

<SEO
        metadescription="List of writings that I've written."
        title="Writings"
/>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4">
    <nav class="text-gray-600 font-medium text-sm line-clamp-1 pr-4">
        <a class="hover:text-gray-500 hover:underline cursor-pointer" href="/" title="home">home</a>
        <span class="mx-0.5 sm:mx-1">/</span>
        {#each getBreadcrumbs() as breadcrumb, index}
            {#if !breadcrumb.isCurrent}
                <a href={breadcrumb.url} class="hover:text-gray-500 hover:underline cursor-pointer"
                   title={breadcrumb.url}>
                    {breadcrumb.name}
                </a>
            {:else}
                <span>{breadcrumb.name}</span>
            {/if}
            {#if index < getBreadcrumbs().length - 1}
                <span class="mx-1">/</span>
            {/if}
        {/each}
    </nav>

    <article class="pt-8 space-y-4 text-sm sm:text-base">
        {#each posts as post}
            <section class="text-sm sm:text-base py-4 border-b border-gray-200">
                <h3 class="font-medium text-gray-800">
                    <a href={`/writings/${post.slug}`}
                       class="hover:text-blue-600 transition-colors duration-200 ease-in-out">
                        {post.title}
                    </a>
                </h3>
                <div class="flex items-center justify-between text-sm">
                    <p class="text-gray-400 mt-2">{post.date}</p>
                    <p class="text-gray-400 mt-2">{post.readTime}</p>
                </div>
            </section>
        {/each}
    </article>
</main>
<Footer/>
