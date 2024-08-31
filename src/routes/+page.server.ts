import { allPosts } from 'content-collections';

export async function load() {
	const limitedPosts = allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
	return {
		posts: limitedPosts
	};
}