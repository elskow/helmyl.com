import type { Context, Document } from '@content-collections/core';
import { defineCollection } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import { dirname, join } from 'path';
import { z } from 'zod';
import { markdownOptions } from './markdown-options';
import { setCurrentContentDir } from './plugins';
import { calcLastModified } from './utils';

interface AboutData extends Document {
	content: string;
}

export const about = defineCollection({
	name: 'about',
	directory: 'contents/',
	schema: z.object({
		color: z.string().optional()
	}),
	include: 'about.md',
	transform: async (data: AboutData, context: Context) => {
		const { collection } = context;
		const root = collection.directory;
		const lastModified = await calcLastModified(data._meta.filePath, root);

		// Set content directory for rehype plugin
		const contentDir = join(root, dirname(data._meta.filePath));
		setCurrentContentDir(contentDir);

		const html = await compileMarkdown(context, data, markdownOptions);

		return {
			...data,
			lastModified,
			html: html.replace(/\/static/g, '')
		};
	}
});
