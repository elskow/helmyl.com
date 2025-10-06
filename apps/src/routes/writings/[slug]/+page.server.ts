import { error } from '@sveltejs/kit';
import { allPosts } from 'content-collections';
import type { PageServerLoad } from './$types';
import type { Post } from 'content-collections';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;
	const post = allPosts.find((item: Post) => item.slug === slug);
	if (!post) {
		throw error(404, { message: `/${slug} not found` });
	}

	return { post };
};
