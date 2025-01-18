import type { RequestHandler } from '@sveltejs/kit';
import * as sitemap from 'super-sitemap';
import { allPosts } from 'content-collections';
import labsMetadata from '$lib/generated/labs-metadata.json';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const posts = allPosts.map((post) => post.slug);
	const labSlugs = labsMetadata.map((lab) => lab.slug);

	return await sitemap.response({
		origin: `${import.meta.env.DEV ? 'http://localhost:5173' : 'https://helmyl.com'}`,
		excludeRoutePatterns: [
			'^/writings$',
			'^/labs/\\[slug\\]', // Exclude the dynamic lab route
			'^/labs/.*\\.html$' // Exclude .html files in labs
		],
		paramValues: {
			'/writings/[slug]': posts
			// Remove the labs paramValues since we're serving static files
		},
		additionalPaths: [
			// Add labs as static paths
			...labSlugs.map((slug) => `/labs/${slug}`)
		],
		defaultChangefreq: 'always',
		defaultPriority: 1,
		sort: 'alpha'
	});
};
