import { allProjects } from 'content-collections';
import type { PageServerLoad } from './$types';

const compareByDateDesc = (a: { date: string }, b: { date: string }) =>
	new Date(b.date).getTime() - new Date(a.date).getTime();

export const load: PageServerLoad = async () => {
	// Only send minimal data - explicitly exclude html field to prevent bundling
	const projects = [...allProjects].sort(compareByDateDesc).map((project) => ({
		name: project.name,
		description: project.description,
		github: project.github,
		stacks: project.stacks,
		date: project.date,
		priority: project.priority,
		slug: project.slug,
		lastModified: project.lastModified,
		hasContent: project.html && project.html.trim() !== ''
		// html field is NOT included - this saves significant bundle size
		// hasContent flag tells UI if there's a detail page to link to
	}));

	return { projects };
};
