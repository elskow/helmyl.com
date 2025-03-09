import { error } from '@sveltejs/kit';
import { allProjects } from 'content-collections';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { slug } = params;
	const project = allProjects.find((project) => project.slug === slug);
	if (!project) {
		error(404, { message: `/${slug} not found` });
	}

	return { project };
}
