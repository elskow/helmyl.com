import { allPosts } from 'content-collections';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const posts = allPosts
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.map(post => ({
			title: post.title,
			slug: post.slug,
			date: post.date,
			readTime: post.readTime
		}));

	return { posts };
}