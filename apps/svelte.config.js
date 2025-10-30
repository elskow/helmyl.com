import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: 'index.html',
			pages: 'build',
			assets: 'build',
			precompress: true,
			strict: true
		}),
		inlineStyleThreshold: 4096,
		prerender: {
			handleHttpError: ({ path, message }) => {
				// Ignore 404s for lab routes
				if (path.startsWith('/labs/') || path === '/sitemap.xml') {
					return;
				}

				throw new Error(`${path} ${message}`);
			},
			entries: ['*'],
			handleMissingId: 'warn'
		}
	},
	preprocess: vitePreprocess()
};

export default config;
