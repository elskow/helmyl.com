import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

interface Post {
	title: string;
	slug: string;
	date: string;
	readTime: string;
	image?: string;
	lastModified: string;
	html: string;
	excerpt?: string;
	description?: string;
	tags?: string[];
}

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const response = await fetch(`/api/posts/${params.slug}.json`);

		if (!response.ok) {
			throw error(404, { message: `Post not found: ${params.slug}` });
		}

		const post: Post = await response.json();

		return { post };
	} catch (err) {
		throw error(404, { message: `Post not found: ${params.slug}` });
	}
};
