import { allPosts, allProjects } from 'content-collections';
import type { PageServerLoad } from './$types';

const compareByDateDesc = (a: { date: string }, b: { date: string }) =>
	new Date(b.date).getTime() - new Date(a.date).getTime();

const compareProjects = (
	a: { priority?: number | null; date: string },
	b: { priority?: number | null; date: string }
) => {
	if (a.priority != null && b.priority != null) {
		return b.priority - a.priority;
	}

	if (a.priority != null) {
		return -1;
	}

	if (b.priority != null) {
		return 1;
	}

	return compareByDateDesc(a, b);
};

export const load: PageServerLoad = async () => {
	const limitedPosts = [...allPosts]
		.sort(compareByDateDesc)
		.slice(0, 3)
		.map((post) => ({
			title: post.title,
			slug: post.slug,
			date: post.date,
			readTime: post.readTime
		}));

	const limitedProjects = [...allProjects].sort(compareProjects).slice(0, 6);

	return {
		posts: limitedPosts,
		projects: limitedProjects
	};
};
