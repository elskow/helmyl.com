interface Document {
	lazyloadInstance: {
		update: () => void;
	};
}

declare module 'content-collections' {
	export type { Post, Project, Use, About } from '../../.content-collections/generated/index';

	export {
		allPosts,
		allProjects,
		allUses,
		allAbouts
	} from '../../.content-collections/generated/index.js';
}

declare module '$lib/generated/labs-metadata.json' {
	export interface LabMetadata {
		name: string;
		description: string;
		version: string;
		slug: string;
		author?: string;
		homepage?: string;
		repository?: string;
	}

	const labsMetadata: LabMetadata[];
	export default labsMetadata;
}
