import { type Context, defineCollection, defineConfig, type Meta } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import rehypeExpressiveCode from 'rehype-expressive-code';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';
import rehypePresetMinify from 'rehype-preset-minify';
import type { Pluggable } from 'unified';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

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


/**
 * Collection for posts
 */
type PostData = {
	title: string;
	date: string;
	content: string;
	_meta: Meta;
};

const posts = defineCollection({
	name: 'posts',
	directory: 'contents/posts/',
	include: '*.md',
	schema: (z) => ({
		title: z.string(),
		date: z.string()
	}),
	transform: async (data: PostData, context: Context) => {
		const { cache } = context;
		const lastModified = await cache(data._meta.filePath, async (filePath: string) => {
			const { stdout } = await exec(`git log -1 --format=%ai -- ${filePath}`);
			if (stdout) {
				return new Date(stdout.trim()).toISOString();
			}
			return new Date().toISOString();
		});

		const html = await compileMarkdown(context, data, markdownOptions);

		return {
			...data,
			slug: data.title.toLowerCase().replace(/ /g, '-'),
			readTime: readingTime(data.content).text,
			lastModified,
			html: html.replace(/\/static/g, '')
		};
	}
});

/**
 * Collection for uses
 */
type UsesData = {
	content: string;
	_meta: Meta;
};

const uses = defineCollection({
	name: 'uses',
	directory: 'contents/',
	schema: () => ({}),
	include: 'uses.md',
	transform: async (data: UsesData, context: Context) => {
		const { cache } = context;
		const lastModified = await cache(data._meta.filePath, async (filePath: string) => {
			const { stdout } = await exec(`git log -1 --format=%ai -- ${filePath}`);
			if (stdout) {
				return new Date(stdout.trim()).toISOString();
			}
			return new Date().toISOString();
		});

		const html = await compileMarkdown(context, data, markdownOptions);

		return {
			...data,
			lastModified,
			html: html.replace(/\/static/g, '')
		};
	}
});

export default defineConfig({
	collections: [posts, uses]
});