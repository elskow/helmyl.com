import { allProjects } from 'content-collections';
import type { PageServerLoad } from './$types';

const compareByDateDesc = (a: { date: string }, b: { date: string }) =>
	new Date(b.date).getTime() - new Date(a.date).getTime();

export const load: PageServerLoad = async () => ({
	projects: [...allProjects].sort(compareByDateDesc)
});
