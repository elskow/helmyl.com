import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import labsMetadata from '$lib/generated/labs-metadata.json';
import { dev } from '$app/environment';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;
	const project = labsMetadata.find((p) => p.slug === slug);

	if (!project) {
		throw error(404, `Lab project "${slug}" not found`);
	}

	if (dev) {
		// In development mode, redirect to the static file
		throw redirect(307, `/labs/${slug}/index.html`);
	}

	// In production, stay on the current route
	return {
		project
	};
};
