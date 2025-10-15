import { sveltekit } from '@sveltejs/kit/vite';
import utwm from 'unplugin-tailwindcss-mangle/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';
import webfontDownload from 'vite-plugin-webfont-dl';
import contentCollections from '@content-collections/vite';

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
			Icons({
				compiler: 'svelte',
				autoInstall: true
			}),
			mode === 'production' ? utwm() : null
		],
		build: {
			chunkSizeWarningLimit: 500,
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ['svelte', '@sveltejs/kit']
					},
					assetFileNames: (assetInfo) => {
						for (const name of assetInfo.names) {
							if (name.endsWith('.html')) {
								return 'labs/[name][extname]';
							}
						}
						return '[name][extname]';
					}
				}
			}
		},
		server: {
			headers: {
            	'Cache-Control': 'public, max-age=31536000'
        	},
			fs: {
				allow: ['static']
			}
		}
	};
});
