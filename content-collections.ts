import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import rehypeExpressiveCode from 'rehype-expressive-code';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';
import rehypeImgSize from 'rehype-img-size';
import rehypePresetMinify from 'rehype-preset-minify';

const rehypeExpressiveCodeOptions = {
	themes: ['dracula', 'catppuccin-latte']
};

const posts = defineCollection({
	name: 'posts',
	directory: 'contents/posts/',
	include: '*.md',
	schema: (z) => ({
		title: z.string(),
		date: z.string()
	}),
	transform: async (document, context) => {
		const html = await compileMarkdown(context, document, {
			rehypePlugins: [
				[rehypeKatex, { output: 'mathml' }],
				[rehypeExpressiveCode, rehypeExpressiveCodeOptions],
				[rehypeImgSize, { dir: 'contents/posts/' }],
				rehypePresetMinify
			],
			remarkPlugins: [remarkGfm],
			allowDangerousHtml: true
		});

		return {
			...document,
			slug: document.title.toLowerCase().replace(/ /g, '-'),
			readTime: readingTime(document.content).text,
			html: html.replace(/\/static/g, '')
		};
	}
});

export default defineConfig({
	collections: [posts]
});