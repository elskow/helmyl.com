<script lang="ts">
    import SEO from "$lib/components/SEO/index.svelte";
    import {blur} from "svelte/transition";
    import {getBreadcrumbs} from "$lib/utils/breadcrumbs";
    import ProjectCard from "$lib/components/ProjectCard.svelte";
    import Footer from "$lib/components/Footer.svelte";

    /** @type {import('./$types').PageData} */
    export let data;
    const projects = data.projects;
</script>

<SEO
        metadescription="A collection of projects that I've worked on."
        slug="/"
        title="Projects"
/>

<main class="max-w-4xl mx-auto md:p-8 p-4 mt-4" in:blur={{ duration: 100 }}>
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
        <div class="mt-4 sm:grid-cols-3 grid gap-2 grid-cols-2">
            {#each projects as project}
                <ProjectCard {...project}/>
            {/each}
        </div>
    </article>
</main>
<Footer/>
