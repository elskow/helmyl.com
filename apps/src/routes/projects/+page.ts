import type { PageLoad } from './$types';

export const prerender = true;

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

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/api/projects-metadata.json');
	const projects: ProjectMetadata[] = await response.json();

	// Sort by date descending
	const sortedProjects = projects.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);

	return { projects: sortedProjects };
};
