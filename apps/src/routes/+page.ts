import type { PageLoad } from './$types';

export const prerender = true;

interface PostMetadata {
	title: string;
	slug: string;
	date: string;
	readTime: string;
}

interface ProjectMetadata {
	name: string;
	description: string;
	github: string;
	stacks: string[];
	date: string;
	priority?: number;
	slug: string;
	lastModified: string;
	hasContent: boolean;
}

const compareByDateDesc = (a: { date: string }, b: { date: string }) =>
	new Date(b.date).getTime() - new Date(a.date).getTime();

const compareProjects = (
	a: { priority?: number; date: string },
	b: { priority?: number; date: string }
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

export const load: PageLoad = async ({ fetch }) => {
	// Fetch posts metadata
	const postsResponse = await fetch('/api/posts-metadata.json');
	const allPosts: PostMetadata[] = await postsResponse.json();

	// Fetch projects metadata
	const projectsResponse = await fetch('/api/projects-metadata.json');
	const allProjects: ProjectMetadata[] = await projectsResponse.json();

	// Get limited posts (top 3)
	const posts = [...allPosts].sort(compareByDateDesc).slice(0, 3);

	// Get limited projects (top 3)
	const projects = [...allProjects].sort(compareProjects).slice(0, 3);

	return {
		posts,
		projects
	};
};
