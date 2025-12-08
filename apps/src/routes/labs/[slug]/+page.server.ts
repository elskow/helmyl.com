import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import labsMetadata from '$lib/generated/labs-metadata.json';
import fs from 'fs/promises';
import path from 'path';

async function checkLabAvailability(slug: string): Promise<boolean> {
	try {
		const labPath = path.join(process.cwd(), 'static', 'labs', slug, 'index.html');
		await fs.access(labPath);
		return true;
	} catch {
		return false;
	}
}

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;
	const project = labsMetadata.find((item) => item.slug === slug);

	if (!project) {
		throw error(404, `Lab project "${slug}" not found`);
	}

	const isAvailable = await checkLabAvailability(slug);

	return {
		project,
		launchUrl: `/labs/${slug}/index.html`,
		isAvailable
	};
};
