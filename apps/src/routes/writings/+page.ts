import type { PageLoad } from './$types';

export const prerender = true;

interface PostMetadata {
	title: string;
	slug: string;
	date: string;
	readTime: string;
	image?: string;
	lastModified: string;
}

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/api/posts-metadata.json');
	const posts: PostMetadata[] = await response.json();

	// Sort by date descending
	const sortedPosts = posts.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);

	return { posts: sortedPosts };
};
