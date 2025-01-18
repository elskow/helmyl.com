import labsMetadata from '$lib/generated/labs-metadata.json';

export async function load() {
	return {
		projects: labsMetadata
	};
}
