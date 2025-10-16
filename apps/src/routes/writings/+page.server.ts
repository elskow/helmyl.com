import { allPosts } from 'content-collections';
import type { PageServerLoad } from './$types';

const compareByDateDesc = (a: { date: string }, b: { date: string }) =>
	new Date(b.date).getTime() - new Date(a.date).getTime();

export const load: PageServerLoad = async () => {
	// Only send minimal data - explicitly exclude html field to prevent bundling
	const posts = [...allPosts].sort(compareByDateDesc).map((post) => ({
		title: post.title,
		slug: post.slug,
		date: post.date,
		readTime: post.readTime
		// html field is NOT included - this saves ~400KB+ in bundle size
	}));

	return { posts };
};
