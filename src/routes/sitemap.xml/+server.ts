// /src/routes/sitemap.xml/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import * as sitemap from 'super-sitemap';
import { allPosts } from 'content-collections';

export const prerender = true; // optional

export const GET: RequestHandler = async () => {
	const posts = allPosts.map((post) => post.slug);

	return await sitemap.response({
		origin: `${import.meta.env.DEV ? 'http://localhost:5173' : 'https://helmyl.com'}`,
		excludeRoutePatterns: [
			'^/writings$'
		],
		paramValues: {
			'/writings/[slug]': posts
		},
		headers: {
			// 'custom-header': 'foo', // case-insensitive; xml content type & 1h CDN cache by default
		},
		additionalPaths: [
			// '/foo.pdf' // e.g. to a file in your static dir
		],
		changefreq: 'daily', // excluded by default b/c ignored by modern search engines
		priority: 1, // default is 0.5
		sort: 'alpha' // default is false; 'alpha' sorts all paths alphabetically.
	});
};