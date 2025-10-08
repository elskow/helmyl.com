import {
	type Context,
	defineCollection,
	defineConfig,
	type Document
} from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginFrames } from '@expressive-code/plugin-frames';
import { exec as execCallback } from 'child_process';
import { copyFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import readingTime from 'reading-time';
import rehypeExpressiveCode from 'rehype-expressive-code';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import rehypeMermaid from 'rehype-mermaid';
import rehypePresetMinify from 'rehype-preset-minify';
import rehypeSlug from 'rehype-slug';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import remarkGfm from 'remark-gfm';
import remarkOembed from 'remark-oembed';
import type { Pluggable } from 'unified';
import { promisify } from 'util';
import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
	process.env.PLAYWRIGHT_BROWSERS_PATH = '0';
}

const exec = promisify(execCallback);

// Store content directory for use in rehype plugin
let currentContentDir = '';

const copyImageToStatic = async (imagePath: string, contentDir: string) => {
	try {
		const sourceFile = join(contentDir, imagePath);
		// Preserve the relative path structure
		const relativePath = imagePath.startsWith('./') ? imagePath.slice(2) : imagePath;
		const destFile = join('static/images', relativePath);
		const destDir = dirname(destFile);

		// Ensure destination directory exists
		await mkdir(destDir, { recursive: true });

		// Copy the file
		await copyFile(sourceFile, destFile);

		// Return the web path (absolute path for SvelteKit static assets)
		return `/images/${relativePath}`;
	} catch (error) {
		console.warn(`Failed to copy image ${imagePath}: ${error}`);
		return imagePath;
	}
};

// Custom rehype plugin to process and copy images
const rehypeImageCopy = () => {
	return async (tree: Root) => {
		const promises: Promise<void>[] = [];

		visit(tree, 'element', (node) => {
			const element = node as Element;

			// Only process img elements
			if (element.tagName !== 'img') {
				return;
			}

			const src = element.properties?.src;
			if (typeof src !== 'string') {
				return;
			}

			if (
				!src.startsWith('http://') &&
				!src.startsWith('https://') &&
				!src.startsWith('/') &&
				!src.startsWith('data:')
			) {
				const promise = copyImageToStatic(src, currentContentDir).then((newSrc) => {
					element.properties = {
						...(element.properties ?? {}),
						src: newSrc
					};
				});
				promises.push(promise);
			}
		});

		await Promise.all(promises);
	};
};

const calcLastModified = async (filePath: string, root: string) => {
	try {
		if (process.env.GITHUB_API_TOKEN) {
			const relativePath = root + filePath;
			const response = await fetch(
				`https://api.github.com/repos/elskow/helmyl.com/commits?path=${relativePath}`,
				{
					headers: {
						Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
						Accept: 'application/vnd.github.v3+json'
					}
				}
			);

			if (!response.ok) {
				console.warn(
					`Failed to fetch commit history for ${relativePath}: ${response.status}`
				);
				return new Date().toISOString();
			}

			const commits = await response.json();
			if (commits && commits.length > 0) {
				return new Date(commits[0].commit.author.date).toISOString();
			}
		} else {
			try {
				const { stdout } = await exec(
					`git log -1 --format=%cd --date=iso "${root}${filePath}"`
				);
				if (stdout.trim()) {
					return new Date(stdout.trim()).toISOString();
				}
			} catch (error) {
				console.warn(`Git command failed for ${filePath}: ${error}`);
			}
		}
	} catch (error) {
		console.warn(`Error getting last modified date for ${filePath}: ${error}`);
	}

	return new Date().toISOString();
};

const rehypeExpressiveCodeOptions = {
	themes: ['material-theme-ocean', 'catppuccin-latte'],
	plugins: [pluginCollapsibleSections(), pluginFrames()],
	cssVariables: {
		borderRadius: '0.5rem',
		codePaddingInline: '1.5rem',
		codePaddingBlock: '1.25rem'
	}
};

type Options = {
	allowDangerousHtml?: boolean;
	remarkPlugins?: Pluggable[];
	rehypePlugins?: Pluggable[];
};

const markdownOptions: Options = {
	rehypePlugins: [
		[rehypeKatex, { output: 'html' }],
		rehypeUnwrapImages,
		rehypeImageCopy,
		rehypeSlug,
		[
			rehypeMermaid,
			{
				strategy: 'img-svg',
				launchOptions: {
					channel: 'chromium',
					headless: true
				},
				mermaidConfig: {
					theme: 'dark',
					fontFamily:
						'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
					fontSize: 13,
					themeVariables: {
						/* @see: https://github.com/mermaid-js/mermaid/blob/develop/packages/mermaid/src/themes/theme-dark.js */

						// background: '',
						primaryColor: '#b0b0b0',
						secondaryColor: '#545480',

						// tertiaryColor: '',
						primaryBorderColor: '#4c4c53',
						// secondaryBorderColor: '',
						// tertiaryBorderColor: '',
						primaryTextColor: '#f4f4f5',
						secondaryTextColor: '#f4f4f5',
						// tertiaryTextColor: '',
						lineColor: '#4c4c53',
						textColor: '#f4f4f5',

						mainBkg: '#27272a',
						// secondBkg: '',
						// mainContrastColor: '',
						// darkTextColor: '',
						// border1: '',
						// border2: '',
						// arrowheadColor: '',
						// fontFamily: '',
						fontSize: '13px',
						// labelBackground: '',
						// THEME_COLOR_LIMIT: 12,

						/* Flowchart variables */
						// nodeBkg: '',
						nodeBorder: '#4c4c53',
						clusterBkg: '#2e2d37',
						clusterBorder: '#6e6580',
						// defaultLinkColor: '',
						titleColor: '#d4b8ef',
						edgeLabelBackground: '#544c00',

						/* Sequence Diagram variables */
						actorBorder: '#4c4c53',
						actorBkg: '#27272a',
						actorTextColor: '#f4f4f5',
						// actorLineColor: '',
						signalColor: '#f4f4f5',
						signalTextColor: '#f4f4f5',
						labelBoxBkgColor: '#27272a',
						labelBoxBorderColor: '#4c4c53',
						labelTextColor: '#f4f4f5',
						loopTextColor: '#faf#f4d701afa',
						noteBorderColor: '#7b731a',
						noteBkgColor: '#484826',
						noteTextColor: '#f4d701',
						// activationBorderColor : '',
						// activationBkgColor : '',
						sequenceNumberColor: '#27272a',

						/* Git graph variables */
						git0: '#808080',
						git1: '#4c4c53',
						git2: '#545480',
						git3: '#867d80',
						git4: '#54806f',
						git5: '#75807d',
						git6: '#b0b0b0',
						git7: '#80547c',

						// gitInv0: '',
						// gitInv1: '',
						// gitInv2: '',
						// gitInv3: '',
						// gitInv4: '',
						// gitInv5: '',
						// gitInv6: '',
						// gitInv7: '',

						gitBranchLabel0: '#f4f4f5',
						gitBranchLabel1: '#f4f4f5',
						gitBranchLabel2: '#f4f4f5',
						gitBranchLabel3: '#f4f4f5',
						gitBranchLabel4: '#f4f4f5',
						gitBranchLabel5: '#f4f4f5',
						gitBranchLabel6: '#f4f4f5',
						gitBranchLabel7: '#f4f4f5',

						tagLabelColor: '#f4d701',
						tagLabelBackground: '#484826',
						tagLabelBorder: '#7b731a',
						tagLabelFontSize: '10px',
						commitLabelColor: '#f4f4f5',
						commitLabelBackground: '#62626a',
						commitLabelFontSize: '10px',

						/* State variables */
						transitionColor: '#4c4c53',
						// transitionLabelColor: '',
						stateLabelColor: '#f4f4f5',
						stateBkg: '#27272a',
						// labelBackgroundColor: '',
						// compositeBackground: '',
						// altBackground: '',
						// compositeTitleBackground: '',
						// compositeBorder: '',
						innerEndBackground: '#27272a',
						specialStateColor: '#4c4c53'

						// errorBkgColor: '',
						// errorTextColor: '',

						// fillType0: '',
						// fillType1: '',
						// fillType2: '',
						// fillType3: '',
						// fillType4: '',
						// fillType5: '',
						// fillType6: '',
						// fillType7: '',
					}
				}
			}
		],
		[rehypeExpressiveCode, rehypeExpressiveCodeOptions],
		[
			rehypeExternalLinks,
			{
				target: '_blank',
				rel: ['noopener', 'noreferrer'],
				content: {
					type: 'element',
					tagName: 'svg',
					properties: {
						xmlns: 'http://www.w3.org/2000/svg',
						width: 12,
						height: 12,
						fill: 'currentColor',
						viewBox: '0 0 16 16',
						className: ['ml-1 inline-block']
					},
					children: [
						{
							type: 'element',
							tagName: 'path',
							properties: {
								d: 'M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z'
							}
						},
						{
							type: 'element',
							tagName: 'path',
							properties: {
								d: 'M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z'
							}
						}
					]
				}
			}
		],
		rehypePresetMinify
	],
	// @ts-expect-error -- remark-oembed's types don't align with the plugin tuple signature
	remarkPlugins: [remarkGfm, [remarkOembed]],
	allowDangerousHtml: true
};

interface PostData extends Document {
	title: string;
	date: string;
	image?: string;
	content: string;
}

const posts = defineCollection({
	name: 'posts',
	directory: 'contents/posts/',
	include: '*.md',
	schema: (z) => ({
		title: z.string(),
		date: z.string(),
		image: z.string().optional()
	}),
	transform: async (data: PostData, context: Context) => {
		const { collection } = context;
		const root = collection.directory;
		const lastModified = await calcLastModified(data._meta.filePath, root);

		// Set content directory for rehype plugin
		currentContentDir = join(root, dirname(data._meta.filePath));

		const html = await compileMarkdown(context, data, markdownOptions);

		// Handle frontmatter image field
		let processedImage = data.image;
		if (
			data.image &&
			!data.image.startsWith('http://') &&
			!data.image.startsWith('https://') &&
			!data.image.startsWith('/')
		) {
			processedImage = await copyImageToStatic(data.image, currentContentDir);
		}

		return {
			...data,
			image: processedImage,
			slug: data._meta.filePath.replace('.md', ''),
			readTime: readingTime(data.content).text,
			lastModified,
			html: html.replace(/\/static/g, '')
		};
	}
});

interface ProjectData extends Document {
	name: string;
	description: string;
	github: string;
	stacks?: string[];
	date: string;
	priority?: number;
	content: string;
}

const projects = defineCollection({
	name: 'projects',
	directory: 'contents/projects/',
	schema: (z) => ({
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
		currentContentDir = join(root, dirname(data._meta.filePath));

		const html = await compileMarkdown(context, data, markdownOptions);

		return {
			...data,
			slug: data.name.toLowerCase().replace(/ /g, '-'),
			lastModified,
			html: html.replace(/\/static/g, '')
		};
	}
});

interface UsesData extends Document {
	content: string;
}

const uses = defineCollection({
	name: 'uses',
	directory: 'contents/',
	schema: (z) => ({
		color: z.string().optional()
	}),
	include: 'uses.md',
	transform: async (data: UsesData, context: Context) => {
		const { collection } = context;
		const root = collection.directory;
		const lastModified = await calcLastModified(data._meta.filePath, root);

		// Set content directory for rehype plugin
		currentContentDir = join(root, dirname(data._meta.filePath));

		const html = await compileMarkdown(context, data, markdownOptions);

		return {
			...data,
			lastModified,
			html: html.replace(/\/static/g, '')
		};
	}
});

interface AboutData extends Document {
	content: string;
}

const about = defineCollection({
	name: 'about',
	directory: 'contents/',
	schema: () => ({}),
	include: 'about.md',
	transform: async (data: AboutData, context: Context) => {
		const { collection } = context;
		const root = collection.directory;
		const lastModified = await calcLastModified(data._meta.filePath, root);

		// Set content directory for rehype plugin
		currentContentDir = join(root, dirname(data._meta.filePath));

		const html = await compileMarkdown(context, data, markdownOptions);

		return {
			...data,
			lastModified,
			html: html.replace(/\/static/g, '')
		};
	}
});

export default defineConfig({
	collections: [posts, projects, uses, about]
});
