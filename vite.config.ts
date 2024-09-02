import { sveltekit } from '@sveltejs/kit/vite';
import viteImagemin from '@vheemstra/vite-plugin-imagemin';
import utwm from 'unplugin-tailwindcss-mangle/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';
import webfontDownload from 'vite-plugin-webfont-dl';
import contentCollections from '@content-collections/vite';
import imageminSvgo from 'imagemin-svgo';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import imageminAVIF from 'imagemin-avif';


export default defineConfig(({ mode }) => {
	return {
		css: {
			devSourcemap: true,
			modules: {
				generateScopedName: '[local]_[hash:base64:5]'
			}
		},
		plugins: [
			webfontDownload(),
			sveltekit(),
			contentCollections(),
			viteImagemin({
				plugins: {
					svg: imageminSvgo()
				},
				makeAvif: {
					plugins: {
						jpg: imageminAVIF(),
						jpeg: imageminAVIF(),
						png: imageminAVIF()
					}
				},
				formatFilePath: (filePath) => {
					return filePath.replace(/\.\w+$/, ''); // Remove file extension
				},
				cache: false
			}),
			Icons({
				compiler: 'svelte',
				autoInstall: true
			}),
			mode === 'production' ? utwm() : null
		]
	};
});