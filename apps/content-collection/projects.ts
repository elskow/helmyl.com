import type { Context, Document } from '@content-collections/core';
import { defineCollection } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import { dirname, join } from 'path';
import { z } from 'zod';
import { markdownOptions } from './markdown-options';
import { setCurrentContentDir } from './plugins';
import { calcLastModified } from './utils';

interface ProjectData extends Document {
	name: string;
	description: string;
	github: string;
	stacks?: string[];
	date: string;
	priority?: number;
	content: string;
}

export const projects = defineCollection({
	name: 'projects',
	directory: 'contents/projects/',
	schema: z.object({
		name: z.string(),
		description: z.string(),
		github: z.string(),
		stacks: z.array(z.string()).optional(),
		date: z.string(),
		priority: z.number().optional()
	}),
	include: '*.md',
	transform: async (data: ProjectData, context: Context) => {
		const { collection } = context;
		const root = collection.directory;
		const lastModified = await calcLastModified(data._meta.filePath, root);

		// Set content directory for rehype plugin
		const contentDir = join(root, dirname(data._meta.filePath));
		setCurrentContentDir(contentDir);

		const html = await compileMarkdown(context, data, markdownOptions);

		return {
			...data,
			slug: data.name.toLowerCase().replace(/ /g, '-'),
			lastModified,
			html: html.replace(/\/static/g, '')
		};
	}
});
