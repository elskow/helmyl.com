import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import labsMetadata from '$lib/generated/labs-metadata.json';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;
	const project = labsMetadata.find((item) => item.slug === slug);

	if (!project) {
		throw error(404, `Lab project "${slug}" not found`);
	}

	return {
		project,
		launchUrl: `/labs/${slug}/index.html`
	};
};
