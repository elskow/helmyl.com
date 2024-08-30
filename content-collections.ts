import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import rehypeExpressiveCode from 'rehype-expressive-code';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';
import rehypePresetMinify from 'rehype-preset-minify';
import type { Pluggable } from 'unified';

const rehypeExpressiveCodeOptions = {
	themes: ['dracula', 'catppuccin-latte']
};

type Options = {
	allowDangerousHtml?: boolean;
	remarkPlugins?: Pluggable[];
	rehypePlugins?: Pluggable[];
};

const markdownOptions: Options = {
	rehypePlugins: [
		[rehypeKatex, { output: 'html' }],
		[rehypeExpressiveCode, rehypeExpressiveCodeOptions],
		rehypePresetMinify
	],
	remarkPlugins: [remarkGfm],
	allowDangerousHtml: true
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
		const html = await compileMarkdown(context, document, markdownOptions);

		return {
			...document,
			slug: document.title.toLowerCase().replace(/ /g, '-'),
			readTime: readingTime(document.content).text,
			html: html.replace(/\/static/g, '')
		};
	}
});

const uses = defineCollection({
	name: 'uses',
	directory: 'contents/',
	schema: () => ({}),
	include: 'uses.md',
	transform: async (document, context) => {
		const html = await compileMarkdown(context, document, markdownOptions);

		return {
			...document,
			html: html.replace(/\/static/g, '')
		};
	}
});

export default defineConfig({
	collections: [posts, uses]
});