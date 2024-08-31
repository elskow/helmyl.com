import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import utwm from 'unplugin-tailwindcss-mangle/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';
import contentCollections from '@content-collections/vite';

export default defineConfig(({ mode }) => {
	return {
		plugins: [
			enhancedImages(),
			sveltekit(),
			contentCollections(),
			Icons({
				compiler: 'svelte',
				autoInstall: true
			}),
			mode === 'production' ? utwm() : null
		]
	};
});
