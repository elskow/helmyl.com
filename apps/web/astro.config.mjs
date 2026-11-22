import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	site: 'https://helmyl.com',
	output: 'static',
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'@': new URL('./src/', import.meta.url).pathname
			}
		}
	},
	build: {
		format: 'file',
		inlineStylesheets: 'auto'
	}
});
