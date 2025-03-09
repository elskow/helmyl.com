import { Feed } from 'feed';
import { allPosts } from 'content-collections';

export const prerender = true;

export async function GET() {
	const website = 'https://helmyl.com';
	const feedOptions = {
		title: 'Helmy Luqmanulhakim | Software Engineer',
		description:
			'Software engineer exploring and sharing insights on development, data engineering, and tech solutions.',
		id: website,
		link: website,
		language: 'en',
		favicon: `${website}/favicons/favicon.ico`,
		copyright: `All rights reserved ${new Date().getFullYear()}, Helmy Luqmanulhakim`,
		feedLinks: {
			rss: `${website}/rss.xml`
		},
		author: {
			name: 'Helmy Luqmanulhakim',
			email: 'helmyl.work@gmail.com',
			link: website
		}
	};

	const feed = new Feed(feedOptions);

	const sortedPosts = [...allPosts].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);

	for (const post of sortedPosts) {
		let processedHtml = post.html;

		processedHtml = processedHtml.replace(
			/src=["'](?:\.\.\/)*(?:\.\.\/)*images\//g,
			`src="${website}/images/`
		);

		feed.addItem({
			title: post.title,
			id: `${website}/writings/${post.slug}`,
			link: `${website}/writings/${post.slug}`,
			description: post.excerpt || post.description || '',
			content: processedHtml,
			author: [
				{
					name: 'Helmy Luqmanulhakim',
					link: website
				}
			],
			date: new Date(post.date)
		});
	}

	return new Response(feed.rss2(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
