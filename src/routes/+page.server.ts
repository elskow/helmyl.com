import { allPosts, allProjects } from 'content-collections';

export async function load() {
	const limitedPosts = allPosts
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 3)
		.map(post => ({
			title: post.title,
			slug: post.slug,
			date: post.date,
			readTime: post.readTime
		}));

	const limitedProjects = allProjects
		.sort((a, b) => {
			if (a.priority && b.priority) return b.priority - a.priority;
			if (a.priority) return -1;
			if (b.priority) return 1;
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		})
		.slice(0, 6);

	return {
		posts: limitedPosts,
		projects: limitedProjects
	};
}