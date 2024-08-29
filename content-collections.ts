import { defineCollection, defineConfig } from '@content-collections/core';

const posts = defineCollection({
	name: 'posts',
	directory: 'contents',
	include: '*.md',
	schema: (z) => ({
		title: z.string(),
		date: z.string(),
		slug: z.string()
	})
});

export default defineConfig({
	collections: [posts]
});