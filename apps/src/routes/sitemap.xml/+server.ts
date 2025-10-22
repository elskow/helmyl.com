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

	// Create a map for lastmod dates
	const postLastMod: Record<string, string> = {};
	allPosts.forEach((post: Post) => {
		const lastMod = post.lastModified || post.date;
		postLastMod[`/writings/${post.slug}`] = new Date(lastMod).toISOString();
	});

	const projectLastMod: Record<string, string> = {};
	allProjects.forEach((project: Project) => {
		const lastMod = project.lastModified || project.date;
		if (lastMod) {
			projectLastMod[`/projects/${project.slug}`] = new Date(lastMod).toISOString();
		}
	});

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
		sort: 'alpha',
		changefreq: (path) => {
			if (path === '/') return 'weekly';
			if (path.startsWith('/writings/')) return 'monthly';
			if (path.startsWith('/projects/')) return 'monthly';
			if (path.startsWith('/labs/')) return 'monthly';
			if (path === '/about' || path === '/uses') return 'monthly';
			return 'yearly';
		},
		priority: (path) => {
			if (path === '/') return 1.0;
			if (path === '/writings' || path === '/projects') return 0.9;
			if (path.startsWith('/writings/')) return 0.8;
			if (path.startsWith('/projects/')) return 0.8;
			if (path === '/about') return 0.7;
			if (path.startsWith('/labs/')) return 0.6;
			if (path === '/uses') return 0.5;
			return 0.5;
		},
		processPaths: (paths) => {
			return paths.map((path) => {
				// Add lastmod dates for posts and projects
				if (postLastMod[path]) {
					return { path, lastmod: postLastMod[path] };
				}
				if (projectLastMod[path]) {
					return { path, lastmod: projectLastMod[path] };
				}
				// For other pages, use current date as fallback
				return { path, lastmod: new Date().toISOString() };
			});
		}
	});
};
