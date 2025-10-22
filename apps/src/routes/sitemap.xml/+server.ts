import type { LabMetadata } from '$lib/generated/labs-metadata.json';
import labsMetadata from '$lib/generated/labs-metadata.json';
import type { RequestHandler } from '@sveltejs/kit';
import type { Post, Project } from 'content-collections';
import { allPosts, allProjects } from 'content-collections';
import * as sitemap from 'super-sitemap';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const posts = allPosts.map((post: Post) => post.slug);
	const projects = allProjects.map((project: Project) => project.slug);
	const labSlugs = labsMetadata.map((lab: LabMetadata) => lab.slug);

	return await sitemap.response({
		origin: `${import.meta.env.DEV ? 'http://localhost:5173' : 'https://helmyl.com'}`,
		excludeRoutePatterns: [
			'^/writings$',
			'^/labs/\\[slug\\]', // Exclude the dynamic lab route
			'^/labs/.*\\.html$' // Exclude .html files in labs
		],
		paramValues: {
			'/writings/[slug]': posts,
			'/projects/[slug]': projects
		},
		additionalPaths: [
			// Add labs as static paths
			...labSlugs.map((slug) => `/labs/${slug}`)
		],
		sort: 'alpha'
	});
};
