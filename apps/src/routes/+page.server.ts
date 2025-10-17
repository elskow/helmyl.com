import { allPosts, allProjects } from 'content-collections';
import type { PageServerLoad } from './$types';

const compareByDateDesc = (a: { date: string }, b: { date: string }) =>
	new Date(b.date).getTime() - new Date(a.date).getTime();

const compareProjects = (
	a: { priority?: number | null; date: string },
	b: { priority?: number | null; date: string }
) => {
	if (a.priority != null && b.priority != null) {
		return a.priority - b.priority;
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
	// Only send minimal data - explicitly exclude html field to prevent bundling
	const limitedPosts = [...allPosts]
		.sort(compareByDateDesc)
		.slice(0, 3)
		.map((post) => ({
			title: post.title,
			slug: post.slug,
			date: post.date,
			readTime: post.readTime
			// html field is NOT included
		}));

	// Only send minimal data for projects - explicitly exclude html field
	const limitedProjects = [...allProjects]
		.sort(compareProjects)
		.slice(0, 3)
		.map((project) => ({
			name: project.name,
			description: project.description,
			github: project.github,
			stacks: project.stacks,
			date: project.date,
			priority: project.priority,
			slug: project.slug,
			lastModified: project.lastModified,
			hasContent: project.html && project.html.trim() !== ''
			// html field is NOT included - saves significant bundle size
			// hasContent flag tells UI if there's a detail page to link to
		}));

	return {
		posts: limitedPosts,
		projects: limitedProjects
	};
};
