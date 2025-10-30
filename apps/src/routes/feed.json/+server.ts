import type { RequestHandler } from '@sveltejs/kit';
import { allPosts } from 'content-collections';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const website = 'https://helmyl.com';

	const sortedPosts = [...allPosts].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);

	const feed = {
		version: 'https://jsonfeed.org/version/1.1',
		title: 'Helmy Luqmanulhakim - Software Engineer',
		home_page_url: website,
		feed_url: `${website}/feed.json`,
		description:
			'Software engineer exploring and sharing insights on development, data engineering, and tech solutions.',
		icon: `${website}/favicons/apple-icon-180x180.png`,
		favicon: `${website}/favicons/favicon-32x32.png`,
		language: 'en',
		authors: [
			{
				name: 'Helmy Luqmanulhakim',
				url: website,
				avatar: `${website}/og/home.png`
			}
		],
		items: sortedPosts.map((post) => {
			let processedHtml = post.html;

			// Fix relative image paths
			processedHtml = processedHtml.replace(
				/src=["'](?:\.\.\/)*(?:\.\.\/)*images\//g,
				`src="${website}/images/`
			);

			return {
				id: `${website}/writings/${post.slug}`,
				url: `${website}/writings/${post.slug}`,
				title: post.title,
				content_html: processedHtml,
				summary: post.excerpt || post.description || '',
				image: post.image || `${website}/og/writings/${post.slug}.png`,
				date_published: new Date(post.date).toISOString(),
				date_modified: post.lastModified
					? new Date(post.lastModified).toISOString()
					: new Date(post.date).toISOString(),
				tags: post.tags || [],
				authors: [
					{
						name: 'Helmy Luqmanulhakim',
						url: website
					}
				],
				language: 'en'
			};
		})
	};

	return new Response(JSON.stringify(feed, null, 2), {
		headers: {
			'Content-Type': 'application/feed+json; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
