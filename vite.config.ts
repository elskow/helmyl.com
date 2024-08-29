import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';
import contentCollections from '@content-collections/vite';


export default defineConfig({
	plugins: [
		sveltekit(),
		contentCollections(),
		Icons({
			compiler: 'svelte',
			autoInstall: true
		})
	]
});
