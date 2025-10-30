import type { Element, Root } from 'hast';
import { copyFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { visit } from 'unist-util-visit';

// Store content directory for use in rehype plugin
let currentContentDir = '';

export const setCurrentContentDir = (dir: string) => {
	currentContentDir = dir;
};

export const getCurrentContentDir = () => currentContentDir;

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
export const rehypeImageCopy = () => {
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

// Custom rehype plugin to enhance SEO
export const rehypeSEOEnhancer = () => {
	return (tree: Root) => {
		visit(tree, 'element', (node) => {
			const element = node as Element;

			// Add loading="lazy" and decoding="async" to images for better performance
			if (element.tagName === 'img') {
				element.properties = {
					...(element.properties ?? {}),
					loading: 'lazy',
					decoding: 'async'
				};

				// Add alt text if missing (accessibility + SEO)
				if (!element.properties.alt) {
					const src = element.properties.src as string;
					const filename = src?.split('/').pop()?.split('.')[0] || 'image';
					element.properties.alt = filename.replace(/-/g, ' ');
				}
			}

			// Add rel="noopener noreferrer" to external links for security
			if (element.tagName === 'a') {
				const href = element.properties?.href as string;
				if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
					if (!href.includes('helmyl.com')) {
						element.properties = {
							...(element.properties ?? {}),
							rel: ['noopener', 'noreferrer', 'nofollow']
						};
					}
				}
			}

			// Add proper semantic structure to tables
			if (element.tagName === 'table') {
				element.properties = {
					...(element.properties ?? {}),
					role: 'table'
				};
			}

			// Add language attribute to code blocks
			if (element.tagName === 'code' && element.properties?.className) {
				const className = element.properties.className as string[];
				const lang = className.find((c: string) => c.startsWith('language-'));
				if (lang) {
					element.properties = {
						...(element.properties ?? {}),
						'data-language': lang.replace('language-', '')
					};
				}
			}
		});
	};
};

export { copyImageToStatic };
