import { error } from '@sveltejs/kit';
import { allPosts } from 'content-collections';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { slug } = params;
	const post = allPosts.find((post) => post.slug === slug);
	if (!post) {
		error(404, { message: `/${slug} not found` });
	}

	return { post };
}
