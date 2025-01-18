import type { LabProject } from '$lib/types/labs';

export interface LabsPageData {
	projects: LabProject[];
}

export interface LabPageData {
	project: LabProject;
}
