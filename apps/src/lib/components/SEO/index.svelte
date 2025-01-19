<script lang="ts">
	import defaultFeaturedImage from '$lib/assets/home.png';
	import defaultOgImage from '$lib/assets/home-open-graph.png';
	import defaultOgSquareImage from '$lib/assets/home-opengraph-square.png';
	import defaultTwitterImage from '$lib/assets/home-twitter.png';

	import website from '$lib/website';
	import OpenGraph from './OpenGraph.svelte';
	import SchemaOrg from './SchemaOrg.svelte';
	import Twitter from './Twitter.svelte';

	export const VERTICAL_LINE_ENTITY = '\u007c'; // |

	const {
		author,
		entity,
		facebookAuthorPage,
		facebookPage,
		ogLanguage,
		siteLanguage,
		siteShortTitle,
		siteTitle: defaultSiteTitle,
		siteUrl,
		githubPage,
		linkedinProfile,
		telegramUsername,
		tiktokUsername,
		twitterUsername
	} = website;

	export let article = false;
	export let breadcrumbs: never[] = [];
	export let entityMeta = null;
	export let lastUpdated = '';
	export let datePublished = '';
	export let metadescription = '';
	export let slug = '/';
	export let timeToRead = 0;
	export let title;
	export let siteTitle = defaultSiteTitle; // New prop with default value

	const defaultAlt =
		'A laptop showing a code editor, a notebook, a mechanical keyboard and a pen on a wooden desk';

	// imported props with fallback defaults
	export let featuredImage = {
		url: defaultFeaturedImage,
		alt: defaultAlt,
		width: 672,
		height: 448,
		caption: 'Home page'
	};
	export let ogImage = {
		url: defaultOgImage,
		alt: defaultAlt
	};
	export let ogSquareImage = {
		url: defaultOgSquareImage,
		alt: defaultAlt
	};
	export let twitterImage = {
		url: defaultTwitterImage,
		alt: defaultAlt
	};

	// const pageTitle = `${siteTitle || defaultSiteTitle} ${VERTICAL_LINE_ENTITY} ${title}`;

	const pageTitle = title ? `${title}` : 'Helmy Luqmanulhakim | Software Engineer';
	const url = `${siteUrl}/${slug}`;
	const openGraphProps = {
		article,
		datePublished,
		lastUpdated,
		image: ogImage,
		squareImage: ogSquareImage,
		metadescription,
		ogLanguage,
		pageTitle,
		siteTitle: siteTitle || defaultSiteTitle,
		url,
		...(article ? { datePublished, lastUpdated, facebookPage, facebookAuthorPage } : {})
	};
	const schemaOrgProps = {
		article,
		author,
		breadcrumbs,
		datePublished,
		entity,
		lastUpdated,
		entityMeta,
		featuredImage,
		metadescription,
		siteLanguage,
		siteTitle: siteTitle || defaultSiteTitle,
		siteTitleAlt: siteShortTitle,
		siteUrl,
		title: pageTitle,
		url,
		facebookPage,
		githubPage,
		linkedinProfile,
		telegramUsername,
		tiktokUsername,
		twitterUsername
	};
	const twitterProps = {
		article,
		author,
		twitterUsername,
		image: twitterImage,
		timeToRead
	};
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta content={metadescription} name="description" />
	<meta
		content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
		name="robots"
	/>
	<link href={url} rel="canonical" />
</svelte:head>
<Twitter {...twitterProps} />
<OpenGraph {...openGraphProps} />
<SchemaOrg {...schemaOrgProps} />
