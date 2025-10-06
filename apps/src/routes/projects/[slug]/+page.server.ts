import { error } from '@sveltejs/kit';
import { allProjects } from 'content-collections';
import type { Project } from 'content-collections';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;
	const project = allProjects.find((item: Project) => item.slug === slug);
	if (!project) {
		throw error(404, { message: `/${slug} not found` });
	}

	return { project };
};
