/// <reference types="astro/client" />

declare module '*.astro' {
	import type { AstroComponentFactory } from 'astro';
	const Component: AstroComponentFactory;
	export default Component;
}

declare module '*/labs-metadata.json' {
	export interface LabMetadata {
		name: string;
		description: string;
		version: string;
		slug: string;
		editedAt: string;
		createdAt: string;
		author?: string;
		homepage?: string;
		repository?: string;
	}
	const labs: LabMetadata[];
	export default labs;
}
