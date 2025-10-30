import type { Context, Document } from '@content-collections/core';
import { defineCollection } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import { dirname, join } from 'path';
import readingTime from 'reading-time';
import { z } from 'zod';
import { markdownOptions } from './markdown-options';
import { copyImageToStatic, setCurrentContentDir } from './plugins';
import { calcLastModified } from './utils';

interface PostData extends Document {
	title: string;
	date: string;
	image?: string;
	content: string;
}

export const posts = defineCollection({
	name: 'posts',
	directory: 'contents/posts/',
	include: '*.md',
	schema: z.object({
		title: z.string(),
		date: z.string(),
		image: z.string().optional()
	}),
	transform: async (data: PostData, context: Context) => {
		const { collection } = context;
		const root = collection.directory;
		const lastModified = await calcLastModified(data._meta.filePath, root);

		// Set content directory for rehype plugin
		const contentDir = join(root, dirname(data._meta.filePath));
		setCurrentContentDir(contentDir);

		const html = await compileMarkdown(context, data, markdownOptions);

		// Handle frontmatter image field
		let processedImage = data.image;
		if (
			data.image &&
			!data.image.startsWith('http://') &&
			!data.image.startsWith('https://') &&
			!data.image.startsWith('/')
		) {
			processedImage = await copyImageToStatic(data.image, contentDir);
		}

		// Auto-generate excerpt for SEO (first 160 chars without HTML)
		const plainText = data.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
		const excerpt =
			plainText.length > 160 ? plainText.slice(0, 157).trim() + '...' : plainText;

		return {
			...data,
			image: processedImage,
			slug: data._meta.filePath.replace('.md', ''),
			readTime: readingTime(data.content).text,
			lastModified,
			html: html.replace(/\/static/g, ''),
			excerpt
		};
	}
});
