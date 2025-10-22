import { generateRelatedContent } from '$lib/utils/seo';
import { error } from '@sveltejs/kit';
import type { Post } from 'content-collections';
import { allPosts } from 'content-collections';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;
	const post = allPosts.find((item: Post) => item.slug === slug);
	if (!post) {
		throw error(404, { message: `/${slug} not found` });
	}

	// Generate related articles based on tags
	const relatedArticles = generateRelatedContent(post, allPosts, 3);

	return {
		post,
		relatedArticles
	};
};
