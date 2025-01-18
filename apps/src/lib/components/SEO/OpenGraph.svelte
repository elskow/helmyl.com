<script lang="ts">
    export let article = false;
    export let datePublished = '';
    export let lastUpdated = '';
    export let facebookAuthorPage = '';
    export let facebookPage = '';
    export let image: { url: string; alt: string };
    export let squareImage: { url: string; alt: string };
    export let metadescription = '';
    export let ogLanguage = 'en_US';
    export let pageTitle = '';
    export let siteTitle = '';
    export let url = '';
</script>

<svelte:head>
    <!-- Basic OpenGraph Meta Tags -->
    <meta content={siteTitle} property="og:site_name"/>
    <meta content={ogLanguage} property="og:locale"/>
    <meta content={url} property="og:url"/>
    <meta content={article ? 'article' : 'website'} property="og:type"/>
    <meta content={pageTitle} property="og:title"/>
    <meta content={metadescription} property="og:description"/>

    <!-- Image Meta Tags -->
    {#if image}
        <meta property="og:image" content={image.url}/>
        <meta property="og:image:width" content="1200"/>
        <meta property="og:image:height" content="627"/>
        <meta property="og:image:alt" content={image.alt}/>
        <meta property="og:image:type" content="image/jpeg"/>
    {/if}
    {#if squareImage}
        <meta property="og:image" content={squareImage.url}/>
        <meta property="og:image:width" content="400"/>
        <meta property="og:image:height" content="400"/>
        <meta property="og:image:alt" content={squareImage.alt}/>
        <meta property="og:image:type" content="image/jpeg"/>
    {/if}

    <!-- Article Specific Meta Tags -->
    {#if article}
        <meta property="article:publisher" content={facebookPage}/>
        <meta property="article:author" content={facebookAuthorPage}/>
        <meta property="article:published_time" content={datePublished}/>
        <meta property="article:modified_time" content={lastUpdated}/>
        <meta property="article:section" content="Blog"/>
        <meta property="article:tag" content="Technology"/>
    {/if}

    <!-- Additional OpenGraph Meta Tags for LinkedIn -->
    <meta content={image.url} property="og:image:secure_url"/>
    <meta content={image.alt} property="og:image:alt"/>
    <meta content="image/jpeg" property="og:image:type"/>
    <meta content="1200" property="og:image:width"/>
    <meta content="627" property="og:image:height"/>
    <meta content={metadescription} property="og:description"/>
    <meta content={siteTitle} property="og:site_name"/>
    <meta content={ogLanguage} property="og:locale"/>
</svelte:head>