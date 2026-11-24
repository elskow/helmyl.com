import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
	site: 'https://helmyl.com',
	output: 'static',
	adapter: cloudflare({
		platformProxy: { enabled: true }
	}),
	vite: {
		server: {
			host: '127.0.0.1'
		},
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
