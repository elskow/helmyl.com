import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

interface Project {
	name: string;
	description: string;
	github: string;
	stacks: string[];
	date: string;
	priority?: number;
	slug: string;
	lastModified: string;
	html: string;
	demo?: string;
	image?: string;
}

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const response = await fetch(`/api/projects/${params.slug}.json`);

		if (!response.ok) {
			throw error(404, { message: `Project not found: ${params.slug}` });
		}

		const project: Project = await response.json();

		return { project };
	} catch (err) {
		throw error(404, { message: `Project not found: ${params.slug}` });
	}
};
