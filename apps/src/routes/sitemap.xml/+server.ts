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
		// Set specific priorities and change frequencies for better SEO
		defaultChangefreq: 'weekly',
		defaultPriority: 0.7,
		sort: 'alpha',
		changefreq: {
			'/': 'daily', // Homepage changes frequently with new content
			'/about': 'monthly',
			'/uses': 'monthly',
			'/writings': 'daily', // Blog listing updates with new posts
			'/writings/[slug]': 'monthly', // Individual posts don't change often
			'/projects': 'weekly',
			'/projects/[slug]': 'monthly',
			'/labs': 'weekly',
			'/labs/*': 'monthly'
		},
		priority: {
			'/': 1.0, // Highest priority for homepage
			'/about': 0.8,
			'/writings': 0.9, // High priority for blog
			'/writings/[slug]': 0.8, // Individual blog posts
			'/projects': 0.9,
			'/projects/[slug]': 0.8,
			'/labs': 0.7,
			'/labs/*': 0.6,
			'/uses': 0.6
		}
	});
};
