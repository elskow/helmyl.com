import { allPosts } from 'content-collections';
import type { PageServerLoad } from './$types';

const compareByDateDesc = (a: { date: string }, b: { date: string }) =>
	new Date(b.date).getTime() - new Date(a.date).getTime();

export const load: PageServerLoad = async () => {
	const posts = [...allPosts].sort(compareByDateDesc).map((post) => ({
		title: post.title,
		slug: post.slug,
		date: post.date,
		readTime: post.readTime
	}));

	return { posts };
};
